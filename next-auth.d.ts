import { DefaultSession } from "next-auth"
import "next-auth/jwt"

type OpenIssuerClaims = Record<string, unknown>

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string
    idToken?: string
    issuer?: unknown
    claims?: OpenIssuerClaims
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    idToken?: string
    refreshToken?: string
    expiresAt?: number
    issuer?: unknown
    claims?: OpenIssuerClaims
  }
}
