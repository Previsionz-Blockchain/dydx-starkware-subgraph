ARG VARIANT="16-bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

RUN yarn global add @graphprotocol/graph-cli@0.22.3 && \
    wget https://github.com/LimeChain/matchstick/releases/download/0.1.5/binary-linux-20 -O /usr/bin/matchstick && chmod +x /usr/bin/matchstick