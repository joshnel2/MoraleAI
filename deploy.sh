#!/usr/bin/env bash
set -euo pipefail

# Backend build
pushd web-app/backend >/dev/null
npm install
npm run build
popd >/dev/null

# Frontend build
pushd web-app/frontend >/dev/null
npm install
npm run build || true # vite dev project; customize for prod
popd >/dev/null

# Extension build
pushd chrome-extension >/dev/null
npm install
npm run build
popd >/dev/null

# AI model infra (CDK synth)
pushd ai-model/cdk >/dev/null
npm install
npm run build
# npx cdk synth  # uncomment when configured
popd >/dev/null

echo "Build complete. Customize this script to deploy to your environments."