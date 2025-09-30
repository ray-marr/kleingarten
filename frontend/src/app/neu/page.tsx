"use client";

import { useActionState, useRef, useState, startTransition } from "react";
import { createAdvert, type ActionResult } from "./actions";
import { Lightbulb } from "lucide-react";
import NextImage from "next/image";

const initialState: ActionResult = { ok: false };

// Adapter kept but unused by the form directly; we'll call formAction manually
async function onSubmit(_: ActionResult, formData: FormData) {
  return createAdvert(formData);
}

type ImageItem = {
  file: File;
  preview: string;
  dragImg: HTMLCanvasElement;
  isProcessing: boolean;
};

// Create a square, cropped thumbnail on a canvas to use as the drag image (matches object-cover square)
function createSquareThumbCanvas(
  url: string,
  size = 160,
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      const srcW = img.naturalWidth || img.width;
      const srcH = img.naturalHeight || img.height;
      // object-cover style center-crop to a square
      const srcAspect = srcW / srcH;
      const destAspect = 1;

      let offsetX = 0,
        offsetY = 0,
        drawWidth = srcW,
        drawHeight = srcH;
      if (srcAspect > destAspect) {
        // wider than tall - crop left/right
        drawHeight = srcH;
        drawWidth = srcH * destAspect; // square from the center
        offsetX = (srcW - drawWidth) / 2;
        offsetY = 0;
      } else if (srcAspect < destAspect) {
        // taller than wide - crop top/bottom
        drawWidth = srcW;
        drawHeight = srcW / destAspect;
        offsetX = 0;
        offsetY = (srcH - drawHeight) / 2;
      }
      // Slight transparency for better UX resembling native ghost
      ctx.clearRect(0, 0, size, size);
      ctx.globalAlpha = 0.9;
      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight,
        0,
        0,
        size,
        size,
      );

      resolve(canvas);
    };
    img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
    img.src = url;
  });
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

async function resizeImageToMax900(
  file: File,
): Promise<{ file: File; url: string }> {
  // Load the image
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
      i.src = objectUrl;
    });

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    const maxSide = Math.max(w, h);
    if (maxSide <= 900) {
      // No resize needed; reuse original file and object URL
      return { file, url: objectUrl };
    }

    const scale = 900 / maxSide;
    const targetW = Math.round(w * scale);
    const targetH = Math.round(h * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { file, url: objectUrl };
    }
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const outType = ALLOWED_IMAGE_TYPES.has(file.type)
      ? file.type
      : "image/jpeg";
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(
        resolve,
        outType,
        outType === "image/jpeg" ? 0.92 : undefined,
      ),
    );
    if (!blob) {
      return { file, url: objectUrl };
    }
    const newFile = new File([blob], file.name, { type: outType });
    const newUrl = URL.createObjectURL(newFile);
    // Revoke original since we no longer need it for preview
    URL.revokeObjectURL(objectUrl);
    return { file: newFile, url: newUrl };
  } catch {
    // On failure, return original
    return { file, url: objectUrl };
  }
}

export default function NewAdvertPage() {
  const [state, formAction, isPending] = useActionState(onSubmit, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const dragIndexRef = useRef<number | null>(null);
  const [dragPreview, setDragPreview] = useState<ImageItem[] | null>(null);
  const lastHoverIndexRef = useRef<number | null>(null);

  async function addFiles(newFiles: FileList | File[]) {
    if (isProcessingImages) return;
    const arr = Array.from(newFiles);

    const cleaned = arr.filter((f) => ALLOWED_IMAGE_TYPES.has(f.type));
    if (cleaned.length !== arr.length) {
      setClientError(
        "Nur bekannte Bildformate sind erlaubt (JPG, PNG, WEBP, GIF)",
      );
    }
    const available = Math.max(0, 5 - images.length);
    const toAdd = cleaned.slice(0, available);
    if (cleaned.length > available) {
      setClientError("Maximal 5 Bilder erlaubt");
    }

    if (toAdd.length === 0) return;

    setIsProcessingImages(true);

    // Add provisional items with processing overlay
    const provisionalItems: ImageItem[] = await Promise.all(
      toAdd.map(async (f) => {
        const preview = URL.createObjectURL(f);
        try {
          const dragImg = await createSquareThumbCanvas(preview, 160);
          return { file: f, preview, dragImg, isProcessing: true };
        } catch {
          const c = document.createElement("canvas");
          c.width = 160;
          c.height = 160;
          const ctx = c.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, c.width, c.height);
          }
          return { file: f, preview, dragImg: c, isProcessing: true };
        }
      }),
    );

    setImages((prev) => [...prev, ...provisionalItems]);

    // Sequentially process each to resize and update preview + drag image
    for (let i = 0; i < provisionalItems.length; i++) {
      const idxGlobal = images.length + i; // index in the combined array
      const originalFile = toAdd[i];
      try {
        const { file: resizedFile, url: resizedUrl } =
          await resizeImageToMax900(originalFile);
        const dragImg = await createSquareThumbCanvas(resizedUrl, 160);
        // Update item in place
        setImages((prev) => {
          const next = [...prev];
          const existing = next[idxGlobal];
          if (existing) {
            // revoke previous preview URL
            if (existing.preview && existing.preview !== resizedUrl) {
              try {
                URL.revokeObjectURL(existing.preview);
              } catch {}
            }
            next[idxGlobal] = {
              file: resizedFile,
              preview: resizedUrl,
              dragImg,
              isProcessing: false,
            };
          }
          return next;
        });
      } catch {
        // On failure, at least mark as done to unlock UI
        setImages((prev) => {
          const next = [...prev];
          const existing = next[idxGlobal];
          if (existing) {
            next[idxGlobal] = { ...existing, isProcessing: false };
          }
          return next;
        });
      }
    }

    setIsProcessingImages(false);

    // reset file input so the same file can be selected again if desired
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isProcessingImages) return;
    if (e.target.files) addFiles(e.target.files);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (isProcessingImages) return;
    // If we're currently dragging one of our own images, treat this as a reorder drop, not a file add
    if (dragIndexRef.current !== null) {
      // Let the item-level onDrop handler handle the reorder
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (isProcessingImages) {
      e.dataTransfer.dropEffect = "none";
    }
  }

  function removeImage(idx: number) {
    if (isProcessingImages) return;
    setImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      return next;
    });
  }

  function onDragStart(e: React.DragEvent, idx: number) {
    if (isProcessingImages) return;
    dragIndexRef.current = idx;
    try {
      e.dataTransfer.setData("text/plain", "drag");
    } catch {}
    const item = images[idx];
    if (item?.dragImg) {
      const canvas = item.dragImg;
      const offset = Math.floor(canvas.width / 2);
      try {
        const img = new Image();
        img.src = canvas.toDataURL();
        e.dataTransfer.setDragImage(img, offset, offset);
      } catch (err) {
        console.warn("Could not set drag image:", err);
      }
    }
  }
  function onDragEnd() {
    dragIndexRef.current = null;
    lastHoverIndexRef.current = null;
    setDragPreview(null);
  }
  function onDropReorder(idx: number) {
    const from = dragIndexRef.current;
    if (from === null) return;
    if (dragPreview) {
      setImages(dragPreview);
    } else if (from !== idx) {
      setImages((prev) => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(idx, 0, moved);
        return next;
      });
    }
    dragIndexRef.current = null;
    lastHoverIndexRef.current = null;
    setDragPreview(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClientError(null);

    const formEl = formRef.current;
    const files = images.map((i) => i.file);

    if (files.length > 5) {
      setClientError("Maximal 5 Bilder erlaubt");
      return;
    }

    for (const f of files) {
      if (f.size > 50 * 1024 * 1024) {
        setClientError("Ein oder mehrere Bilder sind größer als 50MB");
        return;
      }
      if (!ALLOWED_IMAGE_TYPES.has(f.type)) {
        setClientError(
          "Nur bekannte Bildformate sind erlaubt (JPG, PNG, WEBP, GIF)",
        );
        return;
      }
    }

    // Dimension check before upload (>=300x300)
    const checkDimensions = (file: File) =>
      new Promise<void>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          const ok = img.width >= 300 && img.height >= 300;
          URL.revokeObjectURL(url);
          ok
            ? resolve()
            : reject(new Error("Bilder müssen mindestens 300x300px groß sein"));
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
    } catch (err: unknown) {
      setClientError((err as Error)?.message || "Bildprüfung fehlgeschlagen");
      return;
    }

    if (isProcessingImages) {
      setClientError("Bitte warten: Bilder werden vorbereitet…");
      return;
    }

    setIsUploading(true);
    try {
      // Get signature from the server
      const sigRes = await fetch("/api/cloudinary-signature");
      if (!sigRes.ok) throw new Error("Signatur konnte nicht erzeugt werden");
      const { signature, timestamp, folder, cloudName, apiKey } =
        await sigRes.json();

      const uploadedPublicIds: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", apiKey);
        fd.append("timestamp", String(timestamp));
        fd.append("signature", signature);
        fd.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: fd,
          },
        );
        if (!uploadRes.ok) {
          const t = await uploadRes.text();
          throw new Error(`Upload fehlgeschlagen: ${t}`);
        }
        const json = await uploadRes.json();
        if (!json.public_id)
          throw new Error("Cloudinary Antwort ohne public_id");
        uploadedPublicIds.push(json.public_id as string);
      }

      // Build final form data for server action (title, description, imagePublicId[])
      const serverFD = new FormData();
      if (formEl) {
        const title =
          (formEl.querySelector("#title") as HTMLInputElement)?.value || "";
        const description =
          (formEl.querySelector("#description") as HTMLTextAreaElement)
            ?.value || "";
        serverFD.set("title", title);
        serverFD.set("description", description);
      }
      for (const id of uploadedPublicIds) {
        serverFD.append("imagePublicId", id);
      }

      startTransition(() => {
        formAction(serverFD);
      });
    } catch (err: unknown) {
      setClientError((err as Error)?.message || "Fehler beim Hochladen");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6 w-full">
      <h1 className="text-3xl font-bold text-emerald-900">
        Neues Angebot einstellen
      </h1>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-4 mt-8 flex flex-col gap-2"
        encType="multipart/form-data"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-xl font-medium text-emerald-900"
          >
            Titel
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={50}
            className="mt-1 block w-full rounded-md border border-emerald-900 p-2 bg-white text-emerald-900"
            placeholder="z.B. Äpfel aus dem Garten"
          />
          {state.fieldErrors?.title && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-xl font-medium text-emerald-900"
          >
            Beschreibung
          </label>
          <textarea
            id="description"
            name="description"
            required
            maxLength={500}
            rows={5}
            className="mt-1 block w-full rounded-md border border-emerald-900 p-2 bg-white text-emerald-900"
            placeholder="Beschreibe dein Angebot..."
          />
          {state.fieldErrors?.description && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.description}
            </p>
          )}
          <p className="mt-1 text-xs text-emerald-700/80">Max. 500 Zeichen</p>
        </div>

        <div className="flex gap-4 flex-col">
          <h2 className="text-xl font-semibold text-emerald-900">Bilder</h2>
          <p className="p-2 rounded-sm bg-gray-100 text-md text-emerald-800 flex items-start gap-2">
            <Lightbulb />
            <span>Inserate mit Fotos sind erfolgreicher</span>
          </p>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="mt-2 rounded-lg border-2 border-dashed border-emerald-600/50 bg-white p-4"
          >
            {images.length > 0 ? (
              <div>
                {/* TODO: sort out breakpoints for grid */}
                <ul className="grid grid-cols-3 gap-3">
                  {(dragPreview ?? images).map((img, idx) => (
                    <li
                      key={img.preview}
                      className="relative group"
                      draggable={!isProcessingImages}
                      onDragStart={(e) => {
                        if (isProcessingImages) return;
                        e.dataTransfer.effectAllowed = "move";
                        onDragStart(e, idx);
                      }}
                      onDragEnd={onDragEnd}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isProcessingImages) return;
                        onDropReorder(idx);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (isProcessingImages) return;
                        e.dataTransfer.dropEffect = "move";
                        const from = dragIndexRef.current;
                        if (from === null) return;
                        const to = idx;
                        if (lastHoverIndexRef.current === to) return;
                        const next = [...images];
                        const [moved] = next.splice(from, 1);
                        next.splice(to, 0, moved);
                        setDragPreview(next);
                        lastHoverIndexRef.current = to;
                      }}
                    >
                      <NextImage
                        src={img.preview}
                        alt={`Bild ${idx + 1}`}
                        width={250}
                        height={250}
                        className="aspect-square w-full object-cover rounded-md border border-emerald-900/20"
                      />
                      {images[0] && img.preview === images[0].preview && (
                        <span className="absolute left-1 top-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-700 text-yellow-100">
                          Titelbild
                        </span>
                      )}
                      {!isProcessingImages && (
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute right-1 top-1 hidden group-hover:flex items-center justify-center h-6 w-6 rounded-full bg-white/90 text-emerald-900 shadow border border-emerald-900/20"
                          aria-label="Bild entfernen"
                          title="Bild entfernen"
                        >
                          ×
                        </button>
                      )}
                      {img.isProcessing && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-md">
                          <div className="h-8 w-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                {images.length < 5 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingImages}
                      className="inline-flex items-center justify-center rounded-sm border border-emerald-900/40 px-3 py-1.5 text-emerald-900 hover:bg-emerald-50 disabled:opacity-60"
                    >
                      Weitere Bilder auswählen
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-center text-emerald-800">
                <p className="text-sm">Bilder hierher ziehen oder</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingImages}
                  className="inline-flex items-center justify-center rounded-sm border border-emerald-900/40 px-3 py-1.5 text-emerald-900 hover:bg-emerald-50 disabled:opacity-60"
                >
                  Dateien auswählen
                </button>
                <p className="text-xs text-emerald-700/80 mt-1">
                  Bis zu 5 Bilder. Jedes Bild: ≤ 50MB und mindestens 300×300px.
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {(clientError || state.fieldErrors?.images) && (
            <p className="mt-2 text-sm text-red-600">
              {clientError || state.fieldErrors?.images}
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-sm bg-emerald-700 px-4 py-2 font-semibold text-yellow-100 hover:bg-emerald-800 disabled:opacity-60"
            disabled={isPending || isUploading || isProcessingImages}
          >
            {isPending || isUploading
              ? "Wird gespeichert…"
              : "Angebot veröffentlichen"}
          </button>
        </div>
      </form>
    </div>
  );
}
