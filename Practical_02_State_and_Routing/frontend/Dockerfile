# React Frontend Dockerfile with Multi-Stage Build (Practical 11)
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm install

# Copy application source code and build production bundle
COPY . .
RUN npm run build

# Expose Vite preview port
EXPOSE 5173

# Serve production build preview accessible to host network
CMD ["npm", "run", "preview", "--", "--host"]
