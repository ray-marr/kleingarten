This is an app for advertising wares from your kleingarten.

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
