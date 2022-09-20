# syntax=docker/dockerfile:1
FROM node:16-alpine AS development

WORKDIR /app

COPY ["package.json", "yarn.json*", "./"]

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn run build

FROM node:16-alpine AS production
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "yarn.json*", "./"]

RUN yarn install --production

# COPY [".env", "./"]

COPY --from=development /app/dist ./dist

CMD ["node", "dist/main"]