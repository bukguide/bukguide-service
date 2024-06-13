FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --force

COPY . .

# RUN npm cache clean --force
# RUN npm install prisma
RUN npx prisma generate

EXPOSE 3000 80

# CMD ["npm", "run", "start:prod"]

RUN npm run build

CMD [ "node", "dist/src/main.js" ]
