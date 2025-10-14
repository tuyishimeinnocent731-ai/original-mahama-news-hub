FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json backend/
RUN npm ci --prefix backend --production
COPY backend/ backend/
RUN mkdir -p /app/uploads
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["node", "backend/server.js"]
