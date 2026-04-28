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

# Set default port for local testing (Cloud Run will override this)
ENV PORT=80
ENV HOST=0.0.0.0

# Copy built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the nginx template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
