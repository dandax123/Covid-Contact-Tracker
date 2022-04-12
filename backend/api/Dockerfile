FROM  node:16-alpine

WORKDIR /usr/src/app

COPY package* ./

RUN npm i

COPY . .

EXPOSE 7000

RUN npm run build

CMD [ "node" ,"./build/index.js"] 