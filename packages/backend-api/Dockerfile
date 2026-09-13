# Imagen de producción — compatible con Render (infrastructure-specification.md)
# node:22-slim no trae OpenSSL instalado, y el motor de Prisma lo necesita para
# funcionar (sin esto: "Prisma failed to detect the libssl/openssl version" ->
# "Schema engine error" en el deploy real a Render, 2026-09-13).
FROM node:22-slim AS build
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
COPY packages/api-contract ./packages/api-contract
COPY packages/backend-api ./packages/backend-api
RUN npm install --workspace=packages/api-contract --workspace=packages/backend-api --include-workspace-root
RUN npm run build --workspace=packages/api-contract
RUN npm run build --workspace=packages/backend-api

FROM node:22-slim AS runtime
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/backend-api/dist ./packages/backend-api/dist
COPY --from=build /app/packages/backend-api/prisma ./packages/backend-api/prisma
COPY --from=build /app/packages/backend-api/package.json ./packages/backend-api/package.json
COPY --from=build /app/packages/api-contract ./packages/api-contract
EXPOSE 3000
CMD ["sh", "-c", "cd packages/backend-api && npx prisma migrate deploy && node dist/main.js"]
