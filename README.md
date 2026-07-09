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
OPENISSUER_SCOPES=openid profile
```

For local root-path development, leave `NEXT_PUBLIC_BASE_PATH` unset. The
Docker image builds with `/nextauth` so it can run behind Gateway API path
routing on the tenant hosts.

For a base-path deployment, `NEXTAUTH_URL` must include the auth route:

```sh
NEXTAUTH_URL=https://free.openissuer.com/nextauth/api/auth
```

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
https://demo.openissuer.com/nextauth/api/auth/callback/myauth
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

## GitHub Actions

The GitHub workflow only builds the Docker image. It does not deploy to
Kubernetes.

- pull requests build the image without pushing it
- pushes to any branch build and push `ghcr.io/<owner>/<repo>:latest`

Deployment is done separately with Helm from this repo or from your local
deployment workflow.

## Deploy To Kubernetes

Deployments are done manually with Helm. GitHub Actions builds and pushes the
Docker image, but it does not apply anything to the cluster.

Set the kubeconfig for the OpenIssuer cluster:

```sh
export KUBECONFIG=/Users/sonamsamdupkhangsar/Documents/github/do-k8-terraform-1/utils/kubeconfig_tutorial-1.yaml
```

Confirm the image has been built by GitHub Actions before restarting a
deployment that uses the `latest` tag.

## 10-Minute Free Tenant Quickstart

This flow deploys the example at:

```text
https://free.openissuer.com/nextauth
```

### 1. Register The OAuth Client

In the Free tenant admin portal, create an OAuth client with:

```text
Redirect URI: https://free.openissuer.com/nextauth/api/auth/callback/myauth
Scopes: openid, profile
Grant type: authorization_code
Client authentication: client_secret_basic
```

Submit the client form, then retain the generated client ID and secret. The
client must be registered in the same tenant as the configured issuer.

### 2. Create The Kubernetes Secret

The secret name must be `nextauth-free-secrets` because that is the name
referenced by `values-free.yaml`:

```sh
kubectl create secret generic nextauth-free-secrets \
  --from-literal=NEXTAUTH_SECRET="$(openssl rand -hex 32)" \
  --from-literal=OPENISSUER_CLIENT_ID='replace-me' \
  --from-literal=OPENISSUER_CLIENT_SECRET='replace-me' \
  --namespace=main \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 3. Deploy The Example

From this repository:

```sh
helm upgrade --install nextauth-free \
  /Users/sonamsamdupkhangsar/Documents/github/sonam-helm-chart \
  -f values-free.yaml \
  --namespace=main
```

The command upgrades the existing release when it is already installed. It is
not necessary to delete the release first.

### 4. Verify Sign-In

Open `https://free.openissuer.com/nextauth`, select **Sign in**, and complete
authentication. Open the session view after sign-in and verify the issuer,
tenant, subject, and claims.

Confirm the deployment is healthy with:

```sh
kubectl rollout status deployment/nextauth-free --namespace=main
kubectl logs deployment/nextauth-free --namespace=main --tail=100
```

## Business1 Tenant

Repeat the quickstart with these substitutions:

```text
Issuer:       https://business1.openissuer.com/issuer
Application:  https://business1.openissuer.com/nextauth
Callback:     https://business1.openissuer.com/nextauth/api/auth/callback/myauth
Secret name:  nextauth-business1-secrets
Values file:  values-business1.yaml
Release name: nextauth-business1
```

Deploy it with:

```sh
helm upgrade --install nextauth-business1 \
  /Users/sonamsamdupkhangsar/Documents/github/sonam-helm-chart \
  -f values-business1.yaml \
  --namespace=main
```

## Demo Tenant

The demo deployment uses:

```text
Issuer:       https://demo.openissuer.com/issuer
Application:  https://demo.openissuer.com/nextauth
Callback:     https://demo.openissuer.com/nextauth/api/auth/callback/myauth
Secret name:  nextauth-demo-secrets
Values file:  values-demo.yaml
Release name: nextauth-demo
```

Deploy it with:

```sh
helm upgrade --install nextauth-demo \
  /Users/sonamsamdupkhangsar/Documents/github/sonam-helm-chart \
  -f values-demo.yaml \
  --namespace=main
```

## Kubernetes Gateway API Details

The same Docker image is deployed with tenant-specific Helm values. Each values
file supplies the tenant host, issuer, release name, callback base path, and
Kubernetes secret reference.

Use Helm dry-run when you want to see what Helm would render/apply without
changing the cluster:

```sh
helm upgrade --install nextauth-free \
  /Users/sonamsamdupkhangsar/Documents/github/sonam-helm-chart \
  -f values-free.yaml \
  --namespace=main \
  --dry-run --debug
```

Create or update the referenced Kubernetes secrets before deploying. The secret
names are part of the Helm values and must match exactly:

```text
values-free.yaml      -> nextauth-free-secrets
values-business1.yaml -> nextauth-business1-secrets
```

Create the Business1 secret with real client values before deploying that
variant:

```sh
kubectl create secret generic nextauth-business1-secrets \
  --from-literal=NEXTAUTH_SECRET="$(openssl rand -hex 32)" \
  --from-literal=OPENISSUER_CLIENT_ID='replace-me' \
  --from-literal=OPENISSUER_CLIENT_SECRET='replace-me' \
  --namespace=main \
  --dry-run=client -o yaml | kubectl apply -f -
```

If a secret was created with a different name, the deployment will keep using the
old values from the expected secret. Check the secret names with:

```sh
kubectl get secret --namespace=main | grep nextauth
```

After GitHub Actions pushes a new `latest` image, restart the deployment to pull
the new image.

For free:

```sh
kubectl rollout restart deployment/nextauth-free --namespace=main
kubectl rollout status deployment/nextauth-free --namespace=main
```

For Business1:

```sh
kubectl rollout restart deployment/nextauth-business1 --namespace=main
kubectl rollout status deployment/nextauth-business1 --namespace=main
```

## Troubleshooting

- **Login failed after authorization:** confirm the OAuth client form was
  submitted and the callback URI matches exactly.
- **Client not found:** inspect `OPENISSUER_CLIENT_ID` in the running deployment
  and confirm that client exists in the same tenant as `OPENISSUER_ISSUER`.
- **Old client settings remain:** update the exact secret referenced by the
  values file, then restart the deployment.
- **Redirect URI mismatch:** include `/nextauth/api/auth/callback/myauth` for the
  Gateway API deployments.
- **Old application build remains:** wait for the image workflow to finish, then
  restart the deployment because the `latest` tag does not change the pod spec.

Inspect the effective settings without printing secret values:

```sh
kubectl exec deployment/nextauth-free --namespace=main -- \
  printenv OPENISSUER_ISSUER OPENISSUER_CLIENT_ID NEXTAUTH_URL
```

Check logs if login or callback handling fails:

```sh
kubectl logs --namespace=main deploy/nextauth-free --tail=200
kubectl logs --namespace=main deploy/nextauth-business1 --tail=200
```
