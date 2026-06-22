FROM node:20

ARG NEXT_PUBLIC_BASE_PATH=/nextauth
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
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
