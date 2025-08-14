# AI-Profile-Business-Tool

AI-Profile-Business-Tool is a business platform that deploys private employee chatbots to gather personal, emotional, and opinion data (completely anonymized and consent-based), combines it with business metrics to form high-quality datasets, and trains custom AI models to provide strategic insights for CEOs and leadership teams.

## Privacy by Design
- End-to-end approach emphasizing privacy and consent
- Encryption of sensitive-at-rest and in-transit data
- Explicit, revocable consent flows for employees
- Configurable data retention and expiration
- Aggregation-first analytics to avoid exposing identifiable data

## Repository Structure
- `web-app/`: Web application (backend API + frontend UI)
- `chrome-extension/`: Browser extension for authenticated employee chatbot access
- `ai-model/`: AWS-trainable model code and notes
- `schemas/`: Shared JSON Schemas and generated types for cross-component use

## High-Level Workflow
1. Employees interact with private chatbots to provide feedback and insights
2. Data is anonymized and consent-verified, then encrypted and stored
3. Business metrics (e.g., sales, NPS, churn) are uploaded and linked to anonymized sessions
4. Aggregated datasets power analytics dashboards and train custom models
5. Executives view privacy-preserving insights to inform strategy

## Development
This repository is organized for full-stack development with shared types and schemas across backend, frontend, and extension.

- Backend: Node.js/Express with JWT auth and MongoDB (via Mongoose) or PostgreSQL support
- Frontend: React + Tailwind CSS, Axios for API requests, Chart.js for visualizations
- Extension: Chrome extension (Manifest v3) connecting via secure WebSockets to backend

## Security & Compliance
- Follow least-privilege principles for access control
- Encrypt sensitive fields using strong cryptography (AES-256-GCM)
- Store keys securely (e.g., KMS/Secrets Manager)
- Audit logging, data expiration, and consent records maintained

## License
Proprietary. All rights reserved.
