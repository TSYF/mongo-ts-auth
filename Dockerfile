FROM node

RUN mkdir -p /usr/src/app
RUN chmod -R 555 /usr/src/app
WORKDIR /usr/src/app

COPY . .

RUN npm i -g bun
RUN bun install