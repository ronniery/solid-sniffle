# First stage, build
FROM node:16.20.0-alpine as build-stage

# Set the workdir
WORKDIR /app

# Copy all necessary project files
COPY . ./

# Build application
RUN npm install && \
    npm run build

# Second stage, publish
FROM node:16.20.0-alpine as publish-stage

# Set the workdir
WORKDIR /app

# Copy the necessary files
COPY --from=build-stage /app/dist ./
COPY --from=build-stage /app/package.json ./

# Install the necessary dependencies
RUN apk update && apk upgrade && apk add curl && \
    npm install --omit=dev --ignore-scripts && npm install -g cross-env

# Set the health check condition
HEALTHCHECK --interval=30s --timeout=3s \
CMD curl -f "http://localhost:${APP_PORT}/health" || exit 1

# Create an argument for application port
ARG APP_PORT=6000
ENV APP_PORT=$APP_PORT

# Expose the application port
EXPOSE $APP_PORT

# Set the startup command
CMD [ "cross-env", "DEBUG=express:*", "node", "server.js" ]
