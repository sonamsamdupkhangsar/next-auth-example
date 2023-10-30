FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
#EXPOSE 3001
#CMD npm run dev-k8

#For production build do:
RUN npm run build-prod
#and then will start the prod profile 
CMD npm run start