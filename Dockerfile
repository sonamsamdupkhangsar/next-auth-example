FROM node:20

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
EXPOSE 3000
#CMD npm run dev-k8

#For production build do:
RUN pnpm run build-prod
#and then will start the prod profile 
CMD pnpm run start