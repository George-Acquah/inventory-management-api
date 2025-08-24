###################
# BUILD FOR LOCAL DEVELOPMENT
###################
FROM node:20 AS development

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

USER node

###################
# BUILD FOR PRODUCTION
###################
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY . .

# Build the app
RUN pnpm run build

# Install only production deps
RUN rm -rf node_modules && pnpm install --prod --frozen-lockfile && pnpm store prune

###################
# PRODUCTION
###################
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy built app + production dependencies
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY package.json ./

USER node

CMD ["node", "dist/main"]
