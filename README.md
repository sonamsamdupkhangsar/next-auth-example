> The example repository is maintained from a [monorepo](https://github.com/nextauthjs/next-auth/tree/main/apps/example-nextjs). Pull Requests should be opened against [`nextauthjs/next-auth`](https://github.com/nextauthjs/next-auth).

<p align="center">
   <br/>
   <a href="https://next-auth.js.org" target="_blank"><img width="150px" src="https://next-auth.js.org/img/logo/logo-sm.png" /></a>
   <h3 align="center">NextAuth.js Example App</h3>
   <p align="center">
   Open Source. Full Stack. Own Your Data.
   </p>
   <p align="center" style="align: center;">
      <a href="https://npm.im/next-auth">
        <img alt="npm" src="https://img.shields.io/npm/v/next-auth?color=green&label=next-auth">
      </a>
      <a href="https://bundlephobia.com/result?p=next-auth-example">
        <img src="https://img.shields.io/bundlephobia/minzip/next-auth?label=next-auth" alt="Bundle Size"/>
      </a>
      <a href="https://www.npmtrends.com/next-auth">
        <img src="https://img.shields.io/npm/dm/next-auth?label=next-auth%20downloads" alt="Downloads" />
      </a>
      <a href="https://npm.im/next-auth">
        <img src="https://img.shields.io/badge/npm-TypeScript-blue" alt="TypeScript" />
      </a>
   </p>
</p>

## Overview

NextAuth.js is a complete open source authentication solution.

This is an example application that shows how `next-auth` is applied to a basic Next.js app.

The deployed version can be found at [`next-auth-example.vercel.app`](https://next-auth-example.vercel.app)

### About NextAuth.js

NextAuth.js is an easy to implement, full-stack (client/server) open source authentication library originally designed for [Next.js](https://nextjs.org) and [Serverless](https://vercel.com). Our goal is to [support even more frameworks](https://github.com/nextauthjs/next-auth/issues/2294) in the future.

Go to [next-auth.js.org](https://next-auth.js.org) for more information and documentation.

> *NextAuth.js is not officially associated with Vercel or Next.js.*

## Getting Started

### 1. Clone the repository and install dependencies

```
git clone https://github.com/nextauthjs/next-auth-example.git
cd next-auth-example
npm install
```

### 2. Configure your local environment

Copy the .env.local.example file in this directory to .env.local (which will be ignored by Git):

```
cp .env.local.example .env.local
```

Add details for one or more providers (e.g. Google, Twitter, GitHub, Email, etc).

#### Database

A database is needed to persist user accounts and to support email sign in. However, you can still use NextAuth.js for authentication without a database by using OAuth for authentication. If you do not specify a database, [JSON Web Tokens](https://jwt.io/introduction) will be enabled by default.

You **can** skip configuring a database and come back to it later if you want.

For more information about setting up a database, please check out the following links:

* Docs: [next-auth.js.org/adapters/overview](https://next-auth.js.org/adapters/overview)

### 3. Configure Authentication Providers

1. Review and update options in `pages/api/auth/[...nextauth].js` as needed.

2. When setting up OAuth, in the developer admin page for each of your OAuth services, you should configure the callback URL to use a callback path of `{server}/api/auth/callback/{provider}`.

  e.g. For Google OAuth you would use: `http://localhost:3000/api/auth/callback/google`

  A list of configured providers and their callback URLs is available from the endpoint `/api/auth/providers`. You can find more information at https://next-auth.js.org/configuration/providers/oauth

3. You can also choose to specify an SMTP server for passwordless sign in via email.

### 4. Start the application

To run your site locally, use:

```
npm run dev
```

To run on a port like 3001:
```
npm run dev -- -p 3001
```

To run it in production mode, use:

```
npm run build
npm run start
```

### 5. Preparing for Production

Follow the [Deployment documentation](https://next-auth.js.org/deployment)

## Acknowledgements

<a href="https://vercel.com?utm_source=nextauthjs&utm_campaign=oss">
<img width="170px" src="https://raw.githubusercontent.com/nextauthjs/next-auth/canary/www/static/img/powered-by-vercel.svg" alt="Powered By Vercel" />
</a>
<p align="left">Thanks to Vercel sponsoring this project by allowing it to be deployed for free for the entire NextAuth.js Team</p>

## License

ISC

## NextJs token creation procecc
1. send a browser request to 
```
http://my-server:9001/oauth2/authorize?response_type=code&scope=openid%20profile%20email&client_id=nextjs-client&redirect_uri=http://localhost:3001/api/auth/callback/myauth
```
The above should show a login page.  Enter the correct username/password 
which will redirect in the browser itself with the code.

Copy the code and paste in postman:
```
http://localhost:9001/oauth2/token?grant_type=authorization_code&redirect_uri=http://localhost:3001/api/auth/callback/myauth&code=1MYAIujmQssFNqIx5_xY_IAS0sYMDXMzFda2PWvDa0cPwmc2LOKJS6xSNzNSp0Cfq17T5bnkMMApvP6tD4VESC6Eq5imX4AilH7lCITK1RU4jPkEawrjNyLy5yfOlqDy&scope=openid%20email%20profile
```

Click the `Send` button to fire the request and it should come back with following response:
```
{
    "access_token": "eyJraWQiOiI1Yjk0ZGVjYS0wYjg2LTQ5ZjctYjY1Ny1kMThmNjU1NTEyNjMiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJzb25hbSIsImF1ZCI6Im5leHRqcy1jbGllbnQiLCJuYmYiOjE2OTA2NTQ0NDcsInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJlbWFpbCJdLCJpc3MiOiJodHRwOi8vbXktc2VydmVyOjkwMDEiLCJleHAiOjE2OTA2NTQ3NDcsImlhdCI6MTY5MDY1NDQ0N30.KaltK2mddWzO1ksLVe-X2CyTqV2E_1N5t_gCfowD3gsoCRZF39rNWflwFb8DYwhCCuiyPplaP-CQ-uduJPi_ysgiTTKh3DkcPod0vE7quU83i4HYOYcJZu5rqOS8_3Vbr1EwXUODbD12v9g-em8ZWvwthGqJwZoD1hYBzOEsL1792TGBrvKuBvE2ZJ9VcwOwLrHV9qaZx45jKFnx_SyiIJc22QIgvY3lOwfiSmxyHMY74bTKHgNa8RHT-DaQR-tJNxBMZuHW80V1YZ1-b0KFwVQV2FiH2jxv3Rg0K6dUd0ksbD86HxsFUJWK9RSIRQtcFvU0vKMHwCrY8roACXbHWw",
    "scope": "openid profile email",
    "id_token": "eyJraWQiOiI1Yjk0ZGVjYS0wYjg2LTQ5ZjctYjY1Ny1kMThmNjU1NTEyNjMiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJzb25hbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiaXNzIjoiaHR0cDovL215LXNlcnZlcjo5MDAxIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoic29uYW0iLCJnaXZlbl9uYW1lIjoic29uYW0iLCJzaWQiOiJIYUkxS3dlVm1aRVhXZWJVQ0pzRXRZY1Q3bVhXN0ZkcldHRVc0SDVNR2pVIiwiYXVkIjoibmV4dGpzLWNsaWVudCIsImF6cCI6Im5leHRqcy1jbGllbnQiLCJhdXRoX3RpbWUiOjE2OTA2NTQ0MTYsIm5hbWUiOiJzb25hbSIsImV4cCI6MTY5MDY1NjI0NywiaWF0IjoxNjkwNjU0NDQ3LCJmYW1pbHlfbmFtZSI6InNhbWR1cGtoYW5nc2FyIiwiZW1haWwiOiJtZUBzb25hbS5lbWFpbCJ9.i1AkFdND6RfoM9DIN0eojH0WnqsW_bxuUP34fI1y34KqKM2nXTajoL-qF4PoNtZSH3E4g4oCLoUVPYxXHWXKbYoMwdE9fo-00hwDwZ8WtTibCQC6Sha9m0VHpOIZqHsqEXHJtcu3jxHRAXmAHrhdMP-SKy8BYZVkoRBt92bnGgmmCBNJKTRGE1XWtOqXnH9_24DcTyy_Wlpuq02gLp8TaebCRc8JMnw2QeWUc1Loe1xDgzphcR4KJLRqBwXu-m_NCIbcKb3k9kHWDvPJET62ZByOXBE96rJJIVevHzEAOZie_5LWgx3TOD6x49xSHmgGZvYt9kSQJm6YQL9eaqAyqQ",
    "token_type": "Bearer",
    "expires_in": 299
}
```