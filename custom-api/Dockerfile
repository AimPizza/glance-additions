FROM node:alpine as base

ARG NODE_ENV=production

WORKDIR /app

COPY package.json ./

RUN rm -rf node_modules && yarn install && yarn cache clean

COPY . .

CMD ["node", "./app.js"]
