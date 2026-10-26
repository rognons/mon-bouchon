FROM node:23-alpine AS builder
WORKDIR /app

ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL

COPY package*.json ./

RUN npm ci --only=production && npm install -g serve

COPY . .

RUN npm run build

# Production stage
FROM httpd:2.4-alpine

RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/local/apache2/htdocs/
