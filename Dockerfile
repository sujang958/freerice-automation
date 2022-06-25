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
  RUN source $NVM_DIR/nvm.sh && nvm install v18.3.0 && npm i -g yarn pm2

  COPY app.ts package.json yarn.lock tsconfig.json .env /freerice/

  RUN cd /freerice && yarn && yarn build

  ENV NODE_ENV=production

  RUN ["pm2-runtime", "start", "/freerice/dist/app.js"]