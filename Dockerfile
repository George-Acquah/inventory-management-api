###################
# BUILD FOR LOCAL DEVELOPMENT
###################
FROM node:20 AS development
# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /usr/src/app

# Copy dependency manifests
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Install dev dependencies
RUN pnpm install

# Copy the rest of the application
COPY --chown=node:node . .

# Use non-root user for development
USER node

###################
# BUILD FOR PRODUCTION
###################
FROM node:20-alpine AS build

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

COPY --chown=node:node package.json pnpm-lock.yaml ./

# Copy dev node_modules
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

# Copy app source
COPY --chown=node:node . .

# Build the app
RUN pnpm run build


# Set environment
ENV NODE_ENV production

# Install only production dependencies
RUN rm -rf node_modules && pnpm install --prod --frozen-lockfile && pnpm store prune

USER node

###################
# PRODUCTION
###################
FROM node:20-alpine AS production

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy production-ready assets
COPY --chown=node:node package.json pnpm-lock.yaml ./
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist