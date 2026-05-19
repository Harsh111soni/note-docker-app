FROM node:18-alpine

WORKDIR /app

COPY . .

RUN cd backend && npm install

RUN cd client && npm install

RUN cd client && npm run build

EXPOSE 5200

CMD ["node", "backend/server.js"]