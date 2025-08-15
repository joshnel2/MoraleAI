# AI-Profile-Business-Tool

AI-Profile-Business-Tool is a business platform that deploys private employee chatbots to gather personal, emotional, and opinion data (completely anonymized and consent-based), combines it with business metrics to form high-quality datasets, and trains custom AI models to provide strategic insights for CEOs and leadership teams.

## Quick start (Docker Compose)
- Prereqs: Docker & Docker Compose
- Start services:
```
docker compose up --build
```
- API: `http://localhost:4000` (docs at `/docs`)
- Frontend: `http://localhost:5173`
- MongoDB: `mongodb://localhost:27017`

Seed demo data (in another terminal):
```
docker compose exec backend npm run seed
```

## Local development
- Backend
```
cd web-app/backend
npm install
npm run dev
```
- Frontend
```
cd web-app/frontend
npm install
npm run dev
```
- Environment variables (backend)
  - `PORT=4000`
  - `MONGO_URI=mongodb://localhost:27017/ai-pbt`
  - `JWT_SECRET=change-me`
  - `ENCRYPTION_KEY_BASE64` base64-encoded 32-byte key

## Security
- JWT auth with role-based access
- Field-level AES-256-GCM encryption helper
- Consent flags and TTL-based expiration with purge job fallback
- Audit logging for admin/CEO actions

## Notes
- Chrome extension (MV3) connects to backend via socket.io with JWT.
- Metrics upload supports CSV mapping and JSON payloads.
