# Deployment checklist (build + deploy)

This repository contains a Vite React frontend and a Node/Express backend. Follow these steps to deploy locally or to a server.

1) Environment
- Copy .env.example -> .env and set values (DB_*, JWT_SECRET, VITE_API_URL, etc.)
- Ensure the DB is accessible and run migrations.

2) Database
- Start MySQL
- Run migrations:
    mysql -u root -p ${DB_NAME} < migrations/001_create_bookmarks_api_keys_and_fulltext.sql

3) Build frontend
- From repo root:
    npm install
    npm run build
  This generates /dist.

4) Backend
- Install backend dependencies:
    cd backend && npm install
- Ensure .env variables set
- Start backend:
    node backend/server.js
  (Use pm2 or systemd in production.)

5) Docker (optional)
- docker-compose up --build -d
- The stack will start MySQL, backend, frontend (nginx serving dist), and Adminer.

6) Post-deploy
- Create API keys via insert into api_keys table or set PUBLIC_API_KEY in .env
- Run external sync (admin only): POST /api/external/sync with an admin token

7) Notes
- For full-text search: ensure the FULLTEXT index exists and set USE_FULLTEXT=true in your .env.
- The LoginModal is fixed to call App.tsx login signature; App.tsx will redirect to the World category on successful login/register.
- Security: Use HTTPS + reverse proxy (nginx) in production. Keep JWT_SECRET secret.
