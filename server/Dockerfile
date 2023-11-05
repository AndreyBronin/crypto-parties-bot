FROM node:20-alpine as builder

RUN apk update && \
    apk add --no-cache bash openssh-client git python3 make g++

ENV NODE_ENV build

USER node
WORKDIR /home/node

COPY package.json yarn.lock /home/node
RUN yarn install --prod --frozen-lockfile

COPY . /home/node

RUN yarn build

FROM node:20-alpine

ENV NODE_ENV production

USER node
WORKDIR /home/node
ENV PORT 3000

COPY --from=builder /home/node/package.json /home/node/
COPY --from=builder /home/node/yarn.lock /home/node/
COPY --from=builder /home/node/dist/ /home/node/dist/

RUN yarn install --prod --frozen-lockfile

CMD ["node", "dist/main.js"]