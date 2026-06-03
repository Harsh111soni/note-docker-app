# FROM node:18-alpine

# WORKDIR /app

# COPY . .

# RUN cd backend && npm install

# RUN cd client && npm install

# RUN cd client && npm run build

# EXPOSE 5200

# CMD ["node", "backend/server.js"]


FROM node:18 AS builder

WORKDIR /app

COPY . .

RUN cd backend && npm install

RUN cd client && npm install

RUN cd client && npm run build



FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app .

EXPOSE 5000

CMD ["node", "backend/server.js"]