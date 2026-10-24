# Node.js backend Dockerfile (Practical 11)
FROM node:18-alpine

WORKDIR /app

# Install dependencies first for optimal Docker layer caching
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Expose backend REST API port
EXPOSE 5000

# Start Express server
CMD ["node", "server.js"]
