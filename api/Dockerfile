FROM denoland/deno:2.5.4 AS builder
WORKDIR /app

COPY . .

RUN deno cache main.ts

# Production stage
FROM denoland/deno:2.5.4
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app .

CMD ["deno", "task", "start"]
