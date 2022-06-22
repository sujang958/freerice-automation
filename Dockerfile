FROM ubuntu:20.04 

  RUN \
      apt-get update && \
      apt-get install -y curl nano
  
  # Install nvm
  RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
  RUN export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"


  RUN nvm install v18.3.0
  RUN npm i -g yarn pm2

  # COPY package.json /freerice/package.json
  # COPY dist/app.js /freerice/app.js

  ENV NODE_ENV=production