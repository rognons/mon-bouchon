# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies including serve
RUN npm ci --only=production && npm install -g serve

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 4321

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "4321"]