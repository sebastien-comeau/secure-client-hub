FROM node:20.5.1-bullseye-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build envs
ARG BUILD_DATE
ENV BUILD_DATE=$BUILD_DATE
ARG AEM_GRAPHQL_ENDPOINT
ENV AEM_GRAPHQL_ENDPOINT=$AEM_GRAPHQL_ENDPOINT
ARG AUTH_ECAS_BASE_URL
ENV AUTH_ECAS_BASE_URL=$AUTH_ECAS_BASE_URL
ARG MSCA_BASE_URL
ENV MSCA_BASE_URL=$MSCA_BASE_URL
ARG MSCA_EQ_BASE_URL
ENV MSCA_EQ_BASE_URL=$MSCA_EQ_BASE_URL
ARG MSCA_ECAS_RASC_BASE_URL
ENV MSCA_ECAS_RASC_BASE_URL=$MSCA_ECAS_RASC_BASE_URL

ENV NODE_ENV=production


# FROM node:18-alpine3.16 AS production
# ENV NODE_ENV=production
# WORKDIR /app
# COPY --from=build /build/next.config.js ./
# COPY --from=build /build/package*.json ./
# COPY --from=build /build/.next ./.next
# COPY --from=build /build/public ./public
# COPY --from=build /build/tracing.js ./
# COPY --from=build /build/certs/srv113-i-lab-hrdc-drhc-gc-ca-chain.pem ./certs/
# RUN VERSION_NEXT=`node -p -e "require('./package.json').dependencies.next"`&& npm install --no-package-lock --no-save next@"$VERSION_NEXT"

# Runtime envs -- will default to build args if no env values are specified at docker run
ARG AEM_GRAPHQL_ENDPOINT
ENV AEM_GRAPHQL_ENDPOINT=$AEM_GRAPHQL_ENDPOINT
ARG MSCA_BASE_URL
ENV MSCA_BASE_URL=$MSCA_BASE_URL
ARG MSCA_EQ_BASE_URL
ENV MSCA_EQ_BASE_URL=$MSCA_EQ_BASE_URL
ARG MSCA_ECAS_RASC_BASE_URL
ENV MSCA_ECAS_RASC_BASE_URL=$MSCA_ECAS_RASC_BASE_URL

# ECAS/next-auth env start
ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL

ARG CLIENT_SECRET
ENV CLIENT_SECRET=$CLIENT_SECRET

ARG CLIENT_ID
ENV CLIENT_ID=$CLIENT_ID

ARG AUTH_ECAS_BASE_URL
ENV AUTH_ECAS_BASE_URL=$AUTH_ECAS_BASE_URL

ARG AUTH_ECAS_WELL_KNOWN
ENV AUTH_ECAS_WELL_KNOWN=$AUTH_ECAS_WELL_KNOWN

ARG AUTH_ECAS_AUTHORIZATION
ENV AUTH_ECAS_AUTHORIZATION=$AUTH_ECAS_AUTHORIZATION

ARG AUTH_ECAS_TOKEN
ENV AUTH_ECAS_TOKEN=$AUTH_ECAS_TOKEN

ARG AUTH_ECAS_USERINFO
ENV AUTH_ECAS_USERINFO=$AUTH_ECAS_USERINFO

ARG AUTH_PRIVATE
ENV AUTH_PRIVATE=$AUTH_PRIVATE

ARG AUTH_DISABLED
ENV AUTH_DISABLED=$AUTH_DISABLED

ARG AUTH_ECAS_GLOBAL_LOGOUT_URL
ENV AUTH_ECAS_GLOBAL_LOGOUT_URL=$AUTH_ECAS_GLOBAL_LOGOUT_URL
# ECAS/next-auth env end

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# next-i18next
# https://github.com/i18next/next-i18next#docker
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/next-i18next.config.js ./next-i18next.config.js

# install next.js
COPY --from=builder /app/package*.json ./
RUN npm install --no-save next

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD npm run start
