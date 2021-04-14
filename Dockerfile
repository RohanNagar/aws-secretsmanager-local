FROM mhart/alpine-node:15

RUN mkdir -p /aws-secretsmanager-local
WORKDIR /aws-secretsmanager-local

COPY package.json /aws-secretsmanager-local
COPY server.js /aws-secretsmanager-local

RUN npm install --loglevel=silent

EXPOSE 4555

CMD ["node", "server.js"]
