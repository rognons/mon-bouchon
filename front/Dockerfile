FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm install -g serve

COPY . .

RUN npm run build

# Production stage
FROM httpd:2.4-alpine

RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/local/apache2/htdocs/
