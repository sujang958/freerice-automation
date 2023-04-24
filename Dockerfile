FROM mcr.microsoft.com/playwright:v1.22.0-focal
  RUN \
      apt-get update && \
      apt-get install -y curl nano
  
  RUN rm /bin/sh && ln -s /bin/bash /bin/sh

  RUN ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

  RUN mkdir /usr/local/nvm
  ENV NVM_DIR /usr/local/nvm

  # Install nvm
  RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
  RUN source $NVM_DIR/nvm.sh && nvm install v18.3.0 && npm i -g yarn

  WORKDIR /freerice/

  COPY package.json yarn.lock tsconfig.json .env ./
  COPY src ./src/

  RUN yarn && yarn build

  ENV NODE_ENV=production

  CMD ["node", "/freerice/dist/app.js"]