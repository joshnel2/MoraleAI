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

## Security & Compliance
- Consent-first: consent flags required on collection; data expiration via TTL and purge job
- Encryption: AES-256-GCM helper for sensitive fields; HTTPS and encrypted S3
- Anonymization: identifiers hashed to anonymized UUID-like tokens before training/aggregation
- Audit logging: admin/CEO actions recorded
- Data subject rights: delete requests endpoint at `/privacy/data/delete-request` (queue and purge in production)
- Ethical AI: training includes moral alignment weights; document bias mitigations
- Compliance: designed to support GDPR/CCPA principles (notice, consent, purpose limitation, access/deletion)

## Deployment
- See `ai-model/` for AWS infra (CDK) and model scripts
- A `deploy.sh` script can orchestrate building/publishing web-app, packaging the extension, and deploying AI infra (to be customized per environment)

## Notes
- Chrome extension (MV3) connects to backend via socket.io with JWT.
- Metrics upload supports CSV mapping and JSON payloads.
