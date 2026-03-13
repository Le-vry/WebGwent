# WebGwent

SvelteKit + Prisma web app.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Set a valid PostgreSQL connection string in `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
```

3. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run db:migrate:deploy
```

4. Start development server:

```bash
npm run dev
```

## Render Deployment

Use a **Web Service** (not Static Site), since the app uses server routes and Prisma.

### Render service settings

- Build Command: `npm install && npm run build:render`
- Start Command: `npm run start`
- Environment Variable: `DATABASE_URL` (must be PostgreSQL, `postgresql://` or `postgres://`)

### Database migration on deploy

`npm run build:render` handles migrations safely:

- If `prisma/migrations` exists and has files, it runs `prisma migrate deploy`.
- If no migrations are present yet, it skips migration and still builds.
- If migrations exist but `DATABASE_URL` is missing, it fails fast with a clear error.

If you want to run only migrations manually (without build):

```bash
npm run db:migrate:deploy:if-present
```

## Important Prisma Notes

- `npx prisma deploy` is not a valid Prisma command.
- Use `npx prisma migrate deploy` (or `npm run db:migrate:deploy`).
- `prisma migrate deploy` requires SQL files in `prisma/migrations`.

If `prisma/migrations` does not exist yet, create an initial migration locally:

```bash
npx prisma migrate dev --name init
```

Then commit the `prisma/migrations` folder and redeploy.
