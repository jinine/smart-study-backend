# syntax=docker/dockerfile:1
ARG NODE_VERSION=18.17.0

FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app

FROM base as deps
RUN apk add --no-cache make gcc g++ python3
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
RUN npm install
RUN npm install bcrypt dotenv body-parser --save

FROM deps as build
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

FROM base as final
ENV NODE_ENV production
USER node
COPY package.json ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
EXPOSE 4000
CMD npm run start