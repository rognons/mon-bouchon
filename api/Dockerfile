ARG DENO_VERSION=2.0.6

FROM denoland/deno:${DENO_VERSION} AS builder
WORKDIR /app

COPY . .

RUN deno cache main.ts

# Production stage
FROM denoland/deno:alpine-${DENO_VERSION}
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

COPY --from=builder /app .

CMD ["deno", "task", "start"]
