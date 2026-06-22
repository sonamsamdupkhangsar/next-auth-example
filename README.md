# OpenIssuer NextAuth Test Client

This project is a small Next.js app used to verify that an OpenIssuer OAuth
client works for a selected issuer.

It is useful for testing:

- authorization code login through OpenIssuer
- PKCE, state, and nonce handling through NextAuth
- issuer-specific clients for `platform`, `free`, `business1`, and `business2`
- returned OIDC claims on the `/me` page

## Local Setup

Install dependencies:

```sh
npm install
```

Create local environment settings:

```sh
cp .env.local.example .env.local
```

Configure `.env.local`:

```sh
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change-me
OPENISSUER_ISSUER=https://free.openissuer.com/issuer
OPENISSUER_CLIENT_ID=your-client-id
OPENISSUER_CLIENT_SECRET=
OPENISSUER_PROVIDER_ID=myauth
OPENISSUER_SCOPES=openid profile email
```

For local root-path development, leave `NEXT_PUBLIC_BASE_PATH` unset. The
Docker image builds with `/nextauth` so it can run behind Gateway API path
routing on the tenant hosts.

Generate a better `NEXTAUTH_SECRET` with:

```sh
openssl rand -hex 32
```

## OAuth Client Setup

Register this redirect URI in the OpenIssuer client for the issuer being tested:

```text
http://localhost:3000/api/auth/callback/myauth
```

If `OPENISSUER_PROVIDER_ID` is changed, the callback path must match that value:

```text
http://localhost:3000/api/auth/callback/{provider-id}
```

The issuer and client must belong together. For example, a `free` client should
be tested with the `free` issuer URL.

For the Kubernetes Gateway API variants in this repo, register these redirect
URIs:

```text
https://free.openissuer.com/nextauth/api/auth/callback/myauth
https://business1.openissuer.com/nextauth/api/auth/callback/myauth
```

## Run

Start the app:

```sh
npm run dev
```

Open:

```text
http://localhost:3000
```

Sign in, then open `/me` to verify the returned issuer, tenant, subject, and
claims.

## Build

```sh
npm run build-dev
```

Production build and start:

```sh
npm run build-prod
npm run start
```

## Kubernetes Gateway API Variants

The same Docker image can be deployed twice with different Helm values:

```sh
helm upgrade --install nextauth-free sonam/mychart \
  -f values-free.yaml \
  --version 0.1.27 \
  --namespace=backend
```

```sh
helm upgrade --install nextauth-business1 sonam/mychart \
  -f values-business1.yaml \
  --version 0.1.27 \
  --namespace=backend
```

The app is routed under `/nextauth` on each tenant host:

```text
https://free.openissuer.com/nextauth
https://business1.openissuer.com/nextauth
```

Create the referenced Kubernetes secrets before deploying:

```sh
kubectl create secret generic nextauth-free-secrets \
  --from-literal=NEXTAUTH_SECRET='replace-me' \
  --from-literal=OPENISSUER_CLIENT_ID='replace-me' \
  --from-literal=OPENISSUER_CLIENT_SECRET='' \
  --namespace=backend
```

```sh
kubectl create secret generic nextauth-business1-secrets \
  --from-literal=NEXTAUTH_SECRET='replace-me' \
  --from-literal=OPENISSUER_CLIENT_ID='replace-me' \
  --from-literal=OPENISSUER_CLIENT_SECRET='' \
  --namespace=backend
```
