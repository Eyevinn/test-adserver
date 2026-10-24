FROM node:24-slim

WORKDIR /app

ADD . .

RUN npm install

CMD ["npm", "start"]