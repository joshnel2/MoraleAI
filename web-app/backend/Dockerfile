FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* tsconfig.json ./
RUN npm install --production=false
COPY src ./src
RUN npm run build && npm prune --production
EXPOSE 4000
CMD ["node", "dist/server.js"]