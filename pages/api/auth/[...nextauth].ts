import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import GithubProvider from "next-auth/providers/github"
import TwitterProvider from "next-auth/providers/twitter"
import Auth0Provider from "next-auth/providers/auth0"
import { useParams } from 'next/navigation'
import { url } from "inspector"
import { URLSearchParams } from "url"
import { useSearchParams } from 'next/navigation';
import { request } from "http"
import { OAuthChecks, OAuthConfig } from "next-auth/providers"
import { CallbackParamsType, BaseClient } from "openid-client"
import { NextResponse } from "next/server"

// import AppleProvider from "next-auth/providers/apple"
// import EmailProvider from "next-auth/providers/email"

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    /* EmailProvider({
         server: process.env.EMAIL_SERVER,
         from: process.env.EMAIL_FROM,
       }),
    // Temporarily removing the Apple provider from the demo site as the
    // callback URL for it needs updating due to Vercel changing domains

    Providers.Apple({
      clientId: process.env.APPLE_ID,
      clientSecret: {
        appleId: process.env.APPLE_ID,
        teamId: process.env.APPLE_TEAM_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY,
        keyId: process.env.APPLE_KEY_ID,
      },
    }),
    */
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_ID,
      clientSecret: process.env.TWITTER_SECRET,
    }),
    Auth0Provider({
      clientId: process.env.AUTH0_ID,
      clientSecret: process.env.AUTH0_SECRET,
      issuer: process.env.AUTH0_ISSUER,
    }),
    {
      id: "myauth",
      name: "myauthname",
      type: "oauth",
      clientId: "nextjs-client",
      authorization: {
        url: "http://localhost:8087/token-mediator/oauth/authorize",
        params: { scope: "openid email profile" }
       },       
      token: {
        url: "http://localhost:8087/token-mediator/oauth/token", 

        async request(context) {
          console.log("code: %s, redirect_uri: %s", context.params.code, context.params.redirect_uri)
          const tokens = await makeTokenRequest(context)
          console.log('tokens: ', tokens)
          return { tokens }
        }         
      },
     
      idToken: true,
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async jwt({ token }) {
      token.userRole = "admin"
      console.log('admin token: ', token)
      return token
    }
  },
}

export default NextAuth(authOptions)

async function makeTokenRequest(context: { params: CallbackParamsType; checks: OAuthChecks } & { client: BaseClient; provider: OAuthConfig<{ [x: string]: unknown }> & { signinUrl: string; callbackUrl: string } }) {
  console.log("params: ",context.params)
  
  const request = await fetch('http://localhost:8087/token-mediator/oauth/token?code='
    +context.params.code+'&redirect_uri=http://localhost:3001/api/auth/callback/myauth'
    +'&scope=openid%20email%20profile', {   
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'hello': 'world'
            }
          }).then( function(response) {
            return response.json();
          }).then(function(data) {
            console.log(' data is now: ', data);
            return data;
          });
          return request;
}