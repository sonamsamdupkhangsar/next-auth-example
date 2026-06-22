import NextAuth, { NextAuthOptions } from "next-auth"
import jwtDecode from "jwt-decode"

const providerId = process.env.OPENISSUER_PROVIDER_ID || "myauth"
const issuer = normalizeUrl(process.env.OPENISSUER_ISSUER || process.env.AUTH_SERVER) || "http://localhost:9001/issuer"
const clientId = process.env.OPENISSUER_CLIENT_ID || process.env.CLIENT_ID || "missing-openissuer-client-id"
const clientSecret = process.env.OPENISSUER_CLIENT_SECRET
const scopes = process.env.OPENISSUER_SCOPES || "openid profile email"

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: providerId,
      name: "OpenIssuer",
      type: "oauth",
      clientId,
      clientSecret,
      wellKnown: `${issuer}/.well-known/openid-configuration`,
      userinfo: `${issuer}/userinfo`,
      authorization: {
        url: `${issuer}/oauth2/authorize`,
        params: {
          scope: scopes,
        },
      },
      token: `${issuer}/oauth2/token`,
      idToken: true,
      checks: ["pkce", "state", "nonce"],
      client: {
        token_endpoint_auth_method: clientSecret ? "client_secret_basic" : "none",
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.preferred_username || profile.email,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.idToken = account.id_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at

        const claims = decodeClaims(account.id_token || account.access_token)
        token.claims = claims
        token.issuer = claims?.iss
      }

      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.idToken = token.idToken
      session.issuer = token.issuer
      session.claims = token.claims

      return session
    },
  },
}

export default NextAuth(authOptions)

function normalizeUrl(value?: string) {
  return value?.replace(/\/+$/, "")
}

function decodeClaims(token?: string) {
  if (!token) {
    return undefined
  }

  try {
    return jwtDecode<Record<string, unknown>>(token)
  } catch {
    return undefined
  }
}
