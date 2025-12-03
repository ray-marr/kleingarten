App for advertising wares from your kleingarten.

TODO: implement location searching

## Getting Started
### First, run the development server:
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database (PostGIS + Drizzle ORM)

### Run PostGIS database in docker:
```bash
docker rm -f kg-postgis
docker run --name kg-postgis \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -p 5432:5432 \
  -d postgis/postgis
```

### Configure environment
Set your database URL in frontend/.env:
```
# frontend/.env
DATABASE_URL=postgres://postgres:mysecretpassword@localhost:5432/postgres
```

### Install dependencies
```bash
cd frontend
npm install
```

### Run migrations (Drizzle)
We ship an initial migration that creates the required tables (users, ads, images) and enables the PostGIS extension.
```bash
cd frontend
npm run drizzle:migrate
```

This will apply the SQL in frontend/drizzle/0000_init.sql. You can also generate new migrations from the schema with:
```bash
npm run drizzle:generate
```

### Schema overview
- users: id (pk), username, telephone, email
- ads: id (pk), title (varchar(50)), description (varchar(500)), user_id (fk->users.id), coordinates (geography(Point,4326)), address (varchar(100))
- images: id (pk), ads_id (fk->ads.id), image_name (varchar(50)), url (varchar(50))


## Drizzle scripts in package.json

The frontend/package.json defines several helper scripts for working with Drizzle Kit and your database. Here’s what each one does and when to use it.

- drizzle:generate
  - Command: drizzle-kit generate --config=drizzle.config.ts
  - Purpose: Reads your TypeScript schema (frontend/src/db/schema.ts via drizzle.config.ts) and produces a new SQL migration file under frontend/drizzle/.
  - When to use: After you change the schema (add/rename columns, tables, indexes) and want to create a migration you can review and run later with migrate.

- drizzle:generate-custom
  - Command: drizzle-kit generate --custom
  - Purpose: Creates a blank/custom migration scaffold so you can write raw SQL manually.
  - When to use: Rare cases where you need hand-written SQL outside of the auto-generated changes (e.g., data backfills, complex SQL, extensions). You will still apply it with migrate or push.

- drizzle:migrate
  - Command: drizzle-kit migrate --config=drizzle.config.ts
  - Purpose: Applies migration files from frontend/drizzle/ to the database and records them in the Drizzle meta table.
  - When to use: Local development and CI to move your database to the latest migration state in a safe, repeatable way.

- drizzle:push
  - Command: drizzle-kit push --config=drizzle.config.ts
  - Purpose: Pushes your current schema state directly to the database without generating or using migration files.
  - When to use: Quick prototyping only. Prefer generate + migrate for team workflows and production. Using push can drift from committed migrations.

- drizzle:drop
  - Command: drizzle-kit drop
  - Purpose: Drops all objects that Drizzle created in the target database.
  - When to use: Only for local development resets. This is destructive and will erase data. Do NOT use against a shared or production database.

Notes
- Config: All commands read settings from frontend/drizzle.config.ts (connection URL, schema path, migrations folder).
- Environment: Ensure DATABASE_URL is set in frontend/.env before running these commands.
- Order of operations: Typical flow is generate -> review SQL -> migrate. Avoid push for production workflows.
