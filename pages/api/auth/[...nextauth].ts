import NextAuth, { NextAuthOptions } from "next-auth"
import { URLSearchParams } from "url"
import { OAuthChecks, OAuthConfig } from "next-auth/providers"
import { CallbackParamsType, BaseClient } from "openid-client"
import jwt_decode from 'jwt-decode'
import pkceChallenge from "pkce-challenge"
import { NextApiRequest, NextApiResponse } from "next"
import React, { createContext, useContext, useState, useEffect } from 'react';


const clientId = '686bc984-510d-40e9-b48e-3980ce0614ea-pkce-client'
var code_challenge = ''
var code_verifier = '';

/*var challenge =  pkceChallenge(128);
const my_challenge = challenge.code_challenge;
const my_challenge_code_verifier = challenge.code_verifier
*/

type CodeChallenge = {
  code_challenge: string,
  code_verifier: string
}

const fetchData = async function getPkce(): Promise<CodeChallenge> {
  const response = await pkceChallenge(128);
  
  return {
    response.code_challenge, response.code_verifier
  }
}
/*
const fetchData = async () => {
  const response = await pkceChallenge(128);
  code_challenge = response.code_challenge
  code_verifier = response.code_verifier
  //setMyGlobalVariable(code_challenge);
  //setMyGlobalVariable(code_verifier);

  return {
    code_challenge, code_verifier
  }

};*/

console.log("fetchData string " + fetchData.code_challenge)



const host = process.env.NEXTAUTH_URL 
const auth_server = process.env.AUTH_SERVER
export const authOptions: NextAuthOptions = {

  providers: [
    {
      id: "myauth",
      name: "SonamCloud",
      type: "oauth",
      clientId: clientId, 
      wellKnown: auth_server + "/.well-known/openid-configuration", 
      
      userinfo:
       {
        url: auth_server+"/userinfo"
       },
      authorization: {
        url:  auth_server+ "/oauth2/authorize?myvalue=ajksdfkjsdfi",
        

        params: { 
          scope: "openid email profile",
          prompt: 'Select Account',
          code_challenge: code_challenge,
          code_challenge_method: "S256",
          redirect_uri: "http://10.0.0.28:3000/api/auth/callback/myauth"
        },
      
       },       
      token: {
        url: auth_server + "/oauth2/token", 
  
        async request(context) {
          console.log("code: %s, redirect_uri: %s", context.params.code, context.params.redirect_uri)
          console.log("making token request");
          const tokens = await makeTokenRequest(context)          
          console.log('tokens: {}', tokens)
          return { tokens }
          }         
      },
     
      idToken: true,      
      //checks: ["pkce", "state", "nonce"],
      profile(profile) {
        console.log('profile: '+ JSON.stringify(profile));

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
      if (account) {
        console.log('jwt account: '+ JSON.stringify(account))
      }
      console.log('jwt token: '+ JSON.stringify(token))

      console.log("jwt user: ", user)
     

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
      
        if (account.refresh_token) {
          token.accessTokenExpires =  account.expires_at!  * 1000 //seconds * 1000 = milliseconds         
        }
      }

      console.log("return token");
      return token
      
    },

    async session({session, token}) {
      if(session) {
        console.log('session: '+ session);
        const dataString = JSON.stringify(session);
        console.log('session dataString: '+ dataString) 
        console.log('session token: '+ JSON.stringify(token))
        if (token) {
          console.log('session 2 token: '+ JSON.stringify(token))
        }
        console.log('token: '+ token.access_token)
        session = Object.assign({}, session, {access_token: token.access_token})
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


async function makeAuthRequest(context: { params: { code: string } }) {
 

  console.log("make auth request params: ",context.params)
  console.log('host: ', host, ', nextAuthUrl: ', process.env.NEXTAUTH_URL)
  
  const url = auth_server + '/oauth2/authorize?'    
  + '&client_id='+clientId
  + '&scope=openid%20email%20profile'
  + '&response_type=code'
  + '&redirect_uri=http%3A%2F%2F10.0.0.28%3A3000%2Fapi%2Fauth%2Fcallback%2Fmyauth'
  + '&prompt=Select%20Account'
  + '&code_challenge=' + code_challenge
  + '&code_challenge_method=S256'

  console.log('url: ' + url)

  const request = await fetch(url, {
           
            method: 'GET',
            headers: {
              'client_id': clientId //'f8590a7f-a2bf-4857-a769-8d4b6549d35e-pkce-client'
            }
            
          }).then( function(response) {
            console.log('response for authorize url: ' + url);
            var json = response.json();
            console.log('response: '+ json)
            return json;
          }).then(function(data) {          
            return data;
          });
          return request;
}

async function makeTokenRequest(context: { params: CallbackParamsType; checks: OAuthChecks } & { client: BaseClient; provider: OAuthConfig<{ [x: string]: unknown }> & { signinUrl: string; callbackUrl: string } }) {
  console.log("params: ",context.params)
  console.log('host: ', host, ', nextAuthUrl: ', process.env.NEXTAUTH_URL)
  
  const formData = new URLSearchParams();
  formData.append('grant_type', 'authorization_code')
  formData.append('code', context.params.code)
  formData.append('client_id', clientId)
  formData.append('redirect_uri', 'http://10.0.0.28:3000/api/auth/callback/myauth')
  formData.append('code_verifier', code_verifier)
  
  console.log('formData: '+ formData)

  const url = auth_server + '/oauth2/token';
  const request = await fetch(url, {
           
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',            
            },
           body: new URLSearchParams(formData)
            
          }).then( function(response) {
            console.log('url: ' + url + ", formData: "+ formData.toString());
            var json = response.json();
            console.log('response: '+ json)
            
            return json;
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
      auth_server + "/oauth2/token?" +      
      new URLSearchParams({
        client_id: clientId,
        grant_type: "refresh_token",
        refresh_token: token.refresh_token      
      })

  const response = await fetch(url, {
    headers: {
      "client_id": clientId
    },
    method: "POST",
  }).then(function(response) {
    console.log('url: '+ url)
      if (!response.ok) {
        console.log('failed to get refresh token: ' + response.text)
        throw new Error("failed to refresh token")
      }
      else  
        return response.json()
    }).then(function(data) {
      return data;
    })
    return response;
}

