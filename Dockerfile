# ---- Build frontend ----
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- Production server ----
FROM node:20-alpine
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy server source
COPY server/src/ ./src/

# Copy built frontend
COPY --from=client-build /app/client/dist ./client-dist

# Create uploads directory
RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=5000
ENV CLIENT_DIST_PATH=/app/client-dist

EXPOSE 5000

CMD ["node", "src/index.js"]
