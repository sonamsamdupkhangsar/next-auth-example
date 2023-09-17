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
//import { request } from "http"
import { OAuthChecks, OAuthConfig } from "next-auth/providers"
import { CallbackParamsType, BaseClient } from "openid-client"
import { NextResponse } from "next/server"
import { Auth } from "@auth/core"
import { type TokenSet } from "@auth/core/types"
import { JWT, getToken } from "next-auth/jwt"
import jwt_decode from 'jwt-decode'
import { parse } from "path"

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
        url: "http://localhost:8080/oauth2-token-mediator/authorize",
        params: { scope: "openid email profile" }
       },       
      token: {
        url: "http://localhost:8080/oauth/token", 

        async request(context) {
          console.log("code: %s, redirect_uri: %s", context.params.code, context.params.redirect_uri)
          const tokens = await makeTokenRequest(context)          
          console.log('tokens: {}', tokens)
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
          image: profile.picture          
        }
      },
    }
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("user: ", user)

      
      
      token.userRole = "admin"      
      console.log('token: ', token)    
      
      if (account) {
        console.log('account: ', account)
        
        token = Object.assign({}, token, { access_token: account.access_token, refresh_token: account.refresh_token });        
        var map = jwt_decode("" + account.access_token) as any
        console.log("parse jwt token: ", map)
        console.log("userRole: ", map.userRole)
        var userRoles = <Array<string>> map.userRole
        if (userRoles.includes('admin')) {
          token.userRole = "admin";
          console.log("set token.userRole to admin");
        }
        
        

        console.log("account expires at: ", account.expires_at)
       // token.refreshToken = account.refresh_token        
       // token.accessToken = account.access_token
        if (account.refresh_token) {
          token.accessTokenExpires =  account.expires_at!  * 1000 //seconds * 1000 = milliseconds         
        }
      }

      // If token has not expired, return it,
      if (Date.now() <  (Number(token.accessTokenExpires))) {
        //Date.now() returns number of milliseconds since epoch
        console.log("token.accessTokenExpires is not expired, Date.now(): ", Date.now(),
        ", token.accessTokenExpires: ", token.accessTokenExpires)
       // return token
      }

      // Otherwise, refresh the token.
      var tokens = await refreshAccessToken(token)
      console.log('token from refresh: ', tokens)
      token = Object.assign({}, token, { access_token: tokens.access_token, refresh_token: tokens.refresh_token });        
      return token
    
      
    },

    async session({session, token}) {
      if(session) {
        session = Object.assign({}, session, {access_token: token.access_token})
        console.log('session: ', session);
        }
      return session
      }
  },
}

declare module "@auth/core/types" {
  interface Session {
    error?: "RefreshAccessTokenError"
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    access_token: string
    expires_at: number
    refresh_token: string
    //add following to test if it works
    userRole: string
    error?: "RefreshAccessTokenError"
  }
}

export default NextAuth(authOptions)

async function makeTokenRequest(context: { params: CallbackParamsType; checks: OAuthChecks } & { client: BaseClient; provider: OAuthConfig<{ [x: string]: unknown }> & { signinUrl: string; callbackUrl: string } }) {
  console.log("params: ",context.params)
  
  const request = await fetch('http://localhost:8080/oauth2-token-mediator/token?grant_type='
    +'authorization_code&code='+context.params.code
    +'&redirect_uri=http://localhost:3001/api/auth/callback/myauth'
    +'&scope=openid%20email%20profile', {
           
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',            
              'client_id': 'nextjs-client'
            }
          }).then( function(response) {
            return response.json();
          }).then(function(data) {          
            return data;
          });
          return request;
}

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: any) {
  console.log('refresh token: ', token.refresh_token);  
  const url =
      "http://localhost:8080/oauth2-token-mediator/token?" +
      new URLSearchParams({
        client_id: "nextjs-client",        
        grant_type: "refresh_token",
        refresh_token: token.refresh_token      
      })

  const response = await fetch(url, {
    headers: {
      "client_id": "nextjs-client"
    },
    method: "POST",
  }).then(function(response) {
      if (!response.ok)
        throw new Error("failed to refresh token")
      else  
        return response.json()
    }).then(function(data) {
      return data;
    })
    return response;
}

