FROM node:22-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

FROM base AS builder
RUN npm ci
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build
RUN npm prune --production

FROM node:22-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE {{PORT}}
USER node
CMD ["npm", "start"]