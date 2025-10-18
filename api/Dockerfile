# Use official Deno image
FROM denoland/deno:2.0.6

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency files first for better caching
COPY deno.json deno.lock* ./

# Cache dependencies
RUN deno cache --reload main.ts || true

# Copy source code
COPY . .

# Cache dependencies again with full source
RUN deno cache main.ts

# Expose port
EXPOSE 8000

# Run the application
CMD ["deno", "task", "start"]