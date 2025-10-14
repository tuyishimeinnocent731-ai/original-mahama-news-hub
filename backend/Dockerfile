FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY backend/package*.json backend/
RUN npm ci --prefix backend --production

# Copy backend source
COPY backend/ backend/

# Create uploads directory
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000
CMD ["node", "backend/server.js"]
