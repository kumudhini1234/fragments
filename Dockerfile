# Stage 1: Build dependencies in a temporary container
FROM node:20-alpine AS builder

LABEL maintainer="Kumudhini Reddicherla <kreddicherla@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Set environment variables
ENV PORT=8080 \
    NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the application source code
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

# Stage 2: Create a minimal production image
FROM node:20-alpine

# Set environment variables
ENV PORT=8080 \
    NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder /app .

# Expose the application port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
