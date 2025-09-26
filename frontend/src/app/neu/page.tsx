"use client";

import { useActionState, useRef, useState, startTransition } from "react";
import { createAdvert, type ActionResult } from "./actions";

const initialState: ActionResult = { ok: false };

// Adapter kept but unused by the form directly; we'll call formAction manually
async function onSubmit(_: ActionResult, formData: FormData) {
  return createAdvert(formData);
}

export default function NewAdvertPage() {
  const [state, formAction, isPending] = useActionState(onSubmit, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClientError(null);

    const formEl = formRef.current;
    const files = Array.from(fileInputRef.current?.files || []);

    // Basic validations
    if (files.length === 0) {
      setClientError("Bitte lade mindestens ein Bild hoch");
      return;
    }
    if (files.length > 5) {
      setClientError("Maximal 5 Bilder erlaubt");
      return;
    }

    for (const f of files) {
      if (f.size > 50 * 1024 * 1024) {
        setClientError("Ein oder mehrere Bilder sind größer als 50MB");
        return;
      }
      if (!f.type.startsWith("image/")) {
        setClientError("Nur Bilddateien sind erlaubt");
        return;
      }
    }

    // Dimension check before upload (>=300x300)
    const checkDimensions = (file: File) => new Promise<void>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const ok = (img.width >= 300 && img.height >= 300);
        URL.revokeObjectURL(url);
        ok ? resolve() : reject(new Error("Bilder müssen mindestens 300x300px groß sein"));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Bild konnte nicht geprüft werden"));
      };
      img.src = url;
    });

    try {
      for (const f of files) {
        await checkDimensions(f);
      }
    } catch (err: any) {
      setClientError(err?.message || "Bildprüfung fehlgeschlagen");
      return;
    }

    setIsUploading(true);
    try {
      // Get signature from server
      const sigRes = await fetch("/api/cloudinary-signature");
      if (!sigRes.ok) throw new Error("Signatur konnte nicht erzeugt werden");
      const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json();

      const uploadedPublicIds: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", apiKey);
        fd.append("timestamp", String(timestamp));
        fd.append("signature", signature);
        fd.append("folder", folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: fd,
        });
        if (!uploadRes.ok) {
          const t = await uploadRes.text();
          throw new Error(`Upload fehlgeschlagen: ${t}`);
        }
        const json = await uploadRes.json();
        if (!json.public_id) throw new Error("Cloudinary Antwort ohne public_id");
        uploadedPublicIds.push(json.public_id as string);
      }

      // Build final form data for server action (title, description, imagePublicId[])
      const serverFD = new FormData();
      if (formEl) {
        const title = (formEl.querySelector('#title') as HTMLInputElement)?.value || "";
        const description = (formEl.querySelector('#description') as HTMLTextAreaElement)?.value || "";
        serverFD.set("title", title);
        serverFD.set("description", description);
      }
      for (const id of uploadedPublicIds) {
        serverFD.append("imagePublicId", id);
      }

      startTransition(() => {
        formAction(serverFD);
      });
    } catch (err: any) {
      setClientError(err?.message || "Fehler beim Hochladen");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-emerald-900">Neues Angebot einstellen</h1>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-emerald-900">Titel</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={50}
            className="mt-1 block w-full rounded-md border border-emerald-200 p-2"
            placeholder="z.B. Äpfel aus dem Garten"
          />
          {state.fieldErrors?.title && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-emerald-900">Beschreibung</label>
          <textarea
            id="description"
            name="description"
            required
            maxLength={500}
            rows={5}
            className="mt-1 block w-full rounded-md border border-emerald-200 p-2"
            placeholder="Beschreibe dein Angebot..."
          />
          {state.fieldErrors?.description && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.description}</p>
          )}
          <p className="mt-1 text-xs text-emerald-700/80">Max. 500 Zeichen</p>
        </div>

        <div>
          <label htmlFor="images" className="block text-sm font-medium text-emerald-900">Bilder (bis zu 5)</label>
          <input
            ref={fileInputRef}
            id="images"
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="mt-1 block w-full"
          />
          <p className="mt-1 text-xs text-emerald-700/80">Bis zu 5 Bilder. Jedes Bild: ≤ 50MB und mindestens 300×300px.</p>
          {(clientError || state.fieldErrors?.images) && (
            <p className="mt-1 text-sm text-red-600">{clientError || state.fieldErrors?.images}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-sm bg-emerald-700 px-4 py-2 font-semibold text-yellow-100 hover:bg-emerald-800 disabled:opacity-60"
            disabled={isPending || isUploading}
          >
            {isPending || isUploading ? "Wird gespeichert…" : "Angebot veröffentlichen"}
          </button>
        </div>
      </form>
    </div>
  );
}
