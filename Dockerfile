FROM mcr.microsoft.com/playwright:v1.22.0-focal
  RUN \
      apt-get update && \
      apt-get install -y curl nano
  
  RUN mkdir /usr/local/nvm
  ENV NVM_DIR /usr/local/nvm

  # Install nvm
  RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
  RUN source $NVM_DIR/nvm.sh && nvm install v18.3.0 && npm i -g yarn pm2

  COPY package.json /freerice/package.json
  COPY dist/app.js /freerice/app.js

  ENV NODE_ENV=production