FROM node:20

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Build the app
RUN npm run build

CMD ["npm", "run", "dev", "--", "--host"]