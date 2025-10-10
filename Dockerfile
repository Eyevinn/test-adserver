FROM node:20-slim

WORKDIR /app

ADD . .

RUN npm install

CMD ["npm", "start"]