FROM node:24

ARG NEXT_PUBLIC_BASE_PATH=/nextauth
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
#CMD npm run dev-k8

#For production build do:
RUN npm run build-prod
#and then will start the prod profile 
CMD ["npm", "run", "start"]
