FROM node:20-alpine

WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN npm install

EXPOSE 5173
CMD ["npm", "run", "dev", "-w", "apps/web", "--", "--host", "0.0.0.0"]
