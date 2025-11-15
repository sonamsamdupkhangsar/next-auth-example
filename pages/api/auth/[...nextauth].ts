import NextAuth, { NextAuthOptions } from "next-auth"
import { URLSearchParams } from "url"
import jwt_decode from 'jwt-decode'
import pkceChallenge from "pkce-challenge"


const clientId = process.env.CLIENT_ID as string
const pkce = await pkceChallenge(128)

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
          code_challenge: pkce.code_challenge,
          code_challenge_method: "S256",
          redirect_uri: host + "/api/auth/callback/myauth"
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
     

      token.adminRole = "admin"      
      console.log('token: ', token)    
      
      if (account) {
        console.log('account: ', account)
        
        token = Object.assign({}, token, { access_token: account.access_token, refresh_token: account.refresh_token });        
        var map = jwt_decode("" + account.access_token) as any
        console.log("parse jwt token: ", map)
        console.log("userRole map: ", map.userRole)
        var userRoles = <Array<string>> [];
        if (map.userRole == undefined) {
            userRoles = ["norole"]
            console.log("add a norole when no roles found")
        }
        else {
          userRoles = <Array<string>> map.userRole
        }
      
        if (userRoles.includes('admin')) {
          token.adminRole = "admin";
          console.log("set token.userRole to admin");
        }
        else if (userRoles.includes('none')) {
          token.noRole = "none"
          console.log("no role found for this user")
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
} //end of of authOptions

export default NextAuth(authOptions)

async function makeTokenRequest(context: any) {
  console.log("params: ",context.params)
  console.log('host: ', host, ', nextAuthUrl: ', process.env.NEXTAUTH_URL)
  
  const formData = new URLSearchParams();
  formData.append('grant_type', 'authorization_code')
  formData.append('code', context.params.code)
  formData.append('client_id', clientId)
  formData.append('redirect_uri', host+ '/api/auth/callback/myauth')
  formData.append('code_verifier', pkce.code_verifier)
  
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
