# Top-level Dockerfile to build and serve the Vite build statically (used by docker-compose frontend service)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy a basic nginx config if you need custom routing; default is fine for SPA
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
