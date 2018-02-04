FROM node:9

RUN apt-get update -y && apt-get install \
    libfreetype6 \
    ghostscript \
    graphicsmagick \
    imagemagick -y

# Setup App
WORKDIR /usr/app

# Install app dependencies
COPY .env ./
COPY package.json ./
COPY yarn.lock ./

RUN yarn

# Bundle app source
COPY ./config ./config
COPY ./src ./src
COPY ./scripts ./scripts

EXPOSE 3000

CMD [ "yarn", "start" ]
