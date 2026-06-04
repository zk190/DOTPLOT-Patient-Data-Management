FROM node:20-alpine

WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN npm install

EXPOSE 4000
CMD ["sh", "-c", "npm run db:push -w apps/api && npm run db:seed -w apps/api && npm run dev -w apps/api"]
