FROM node:lts

WORKDIR /repo

RUN npm install -g @github/copilot

ENTRYPOINT [ "/bin/sh" ]
