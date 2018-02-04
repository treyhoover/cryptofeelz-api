FROM node:9

# Setup App
WORKDIR /usr/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn

# Bundle app source
COPY ./src ./src
COPY ./scripts ./scripts
COPY ./.env ./.env
COPY ./config ./config
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock

EXPOSE 3000

CMD [ "yarn", "start" ]
