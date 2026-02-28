# Portfolio Richard Šebesta

This is a professional portfolio website built with Next.js 15, TailwindCSS, and Prisma (SQLite).
It supports Czech and English natively via browser headers.

## Local Development
1. Install dependencies: `npm install`
2. Run database migrations: `npx prisma db push`
3. Start development server: `npm run dev`

## Docker Deployment

The application is containerized with a standalone build to minimize image size. It mounts a Docker volume for the SQLite database.

1. Make sure Docker and Docker Compose are installed.
2. Run `docker-compose up -d --build`.
3. The app will be available at `http://localhost:3000`.

### Admin Interface
You can view the submitted contact forms at `http://localhost:3000/admin`.
The default password is `admin123`. You can change this in the `docker-compose.yml` under `ADMIN_PASSWORD`.
