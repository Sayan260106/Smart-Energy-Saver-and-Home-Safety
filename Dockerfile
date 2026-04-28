# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
# Note: If you need build-time environment variables, you can pass them here
# ARG GEMINI_API_KEY
# ENV GEMINI_API_KEY=$GEMINI_API_KEY
RUN npm run build

# Production Stage
FROM nginx:stable-alpine

# Copy built files from the build stage to nginx's default public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx configuration to handle SPA routing (optional but recommended)
# If you don't have a custom nginx.conf, nginx will serve index.html by default
# but won't handle client-side routing (e.g. /dashboard) correctly.
# For a simple React app without client-side routing (only one page), this is fine.
# If you add routing, you'll need a custom nginx.conf.

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
