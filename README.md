# OpenIssuer NextAuth Test Client

This project is a small Next.js app used to verify that an OpenIssuer OAuth
client works for a selected issuer.

It is useful for testing:

- authorization code login through OpenIssuer
- PKCE, state, and nonce handling through NextAuth
- issuer-specific clients
- returned OIDC claims on the `/me` page

The active OpenIssuer Kubernetes deployment for this repo is the demo tenant:

```text
https://demo.openissuer.com/nextauth
```

The Free and Business1 values files remain as optional tenant-specific examples.
They are not needed for the current public demo flow unless those tenant
integrations are being tested deliberately.

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
OPENISSUER_ISSUER=https://demo.openissuer.com/issuer
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
NEXTAUTH_URL=https://demo.openissuer.com/nextauth/api/auth
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

For the active demo Kubernetes deployment, register this redirect URI:

```text
https://demo.openissuer.com/nextauth/api/auth/callback/myauth
```

Optional tenant examples use the same path under their own hosts:

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

The commands below use the default kubeconfig from `~/.kube/config`. Ensure
your current context points to the OpenIssuer cluster before deploying.

Confirm the image has been built by GitHub Actions before restarting a
deployment that uses the `latest` tag.

## Demo Tenant Quickstart

This flow deploys the example at:

```text
https://demo.openissuer.com/nextauth
```

### 1. Register The OAuth Client

In the Demo tenant admin portal, create an OAuth client with:

```text
Client ID: nextauth-demo
Redirect URI: https://demo.openissuer.com/nextauth/api/auth/callback/myauth
Scopes: openid, profile
Grant type: authorization_code
Client authentication: client_secret_basic
```

Submit the client form, then retain the client ID and secret. The client must be
registered in the same tenant as the configured issuer.

### 2. Create The Kubernetes Secret

For the OpenIssuer environment, store the values in macOS Keychain and apply the
Kubernetes secret from the infrastructure repository:

```sh
cd /path/to/do-k8-terraform
scripts/store-demo-oauth-client-in-keychain.sh
make demo-nextauth-secret
```

### 3. Deploy The Example

The demo release is included in the infrastructure repository's `helmfile.yaml`:

```sh
cd /path/to/do-k8-terraform
helmfile -f helmfile.yaml sync
```

If only this app needs a restart after a secret update:

```sh
kubectl rollout restart deployment/nextauth-demo --namespace=main
```

### 4. Verify Sign-In

Open `https://demo.openissuer.com/nextauth`, select **Sign in**, and complete
authentication. Open the session view after sign-in and verify the issuer,
tenant, subject, and claims.

Confirm the deployment is healthy with:

```sh
kubectl rollout status deployment/nextauth-demo --namespace=main
kubectl logs deployment/nextauth-demo --namespace=main --tail=100
```

## Optional Free Tenant Example

Free is not part of the current public demo deployment. Use it only when testing
the Free tenant integration specifically.

```text
Issuer:       https://free.openissuer.com/issuer
Application:  https://free.openissuer.com/nextauth
Callback:     https://free.openissuer.com/nextauth/api/auth/callback/myauth
Secret name:  nextauth-free-secrets
Values file:  values-free.yaml
Release name: nextauth-free
```

Deploy it manually with:

```sh
helm upgrade --install nextauth-free \
  /path/to/sonam-helm-chart \
  -f values-free.yaml \
  --namespace=main
```

## Optional Business1 Tenant Example

Business1 is not part of the current public demo deployment. Use it only when
testing the Business1 tenant integration specifically.

```text
Issuer:       https://business1.openissuer.com/issuer
Application:  https://business1.openissuer.com/nextauth
Callback:     https://business1.openissuer.com/nextauth/api/auth/callback/myauth
Secret name:  nextauth-business1-secrets
Values file:  values-business1.yaml
Release name: nextauth-business1
```

Deploy it manually with:

```sh
helm upgrade --install nextauth-business1 \
  /path/to/sonam-helm-chart \
  -f values-business1.yaml \
  --namespace=main
```

## Kubernetes Gateway API Details

The current OpenIssuer deployment uses only the demo tenant values:

```text
values-demo.yaml -> nextauth-demo-secrets
```

`values-free.yaml` and `values-business1.yaml` remain optional tenant-specific
examples, but they are not part of the public demo deployment.

Use Helm dry-run when you want to see what Helm would render/apply without
changing the cluster:

```sh
helm upgrade --install nextauth-demo \
  /path/to/sonam-helm-chart \
  -f values-demo.yaml \
  --namespace=main \
  --dry-run --debug
```

Create or update the demo Kubernetes secret before deploying. The secret name is
part of `values-demo.yaml` and must match exactly:

```text
nextauth-demo-secrets
```

The OpenIssuer infrastructure repo creates or updates this secret from macOS
Keychain:

```sh
cd /path/to/do-k8-terraform
make demo-nextauth-secret
```

If a secret was created with a different name, the deployment will keep using the
old values from the expected secret. Check the secret names with:

```sh
kubectl get secret --namespace=main | grep nextauth
```

After GitHub Actions pushes a new `latest` image, restart the demo deployment to
pull the new image:

```sh
kubectl rollout restart deployment/nextauth-demo --namespace=main
kubectl rollout status deployment/nextauth-demo --namespace=main
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
kubectl exec deployment/nextauth-demo --namespace=main -- \
  printenv OPENISSUER_ISSUER OPENISSUER_CLIENT_ID NEXTAUTH_URL
```

Check logs if login or callback handling fails:

```sh
kubectl logs --namespace=main deploy/nextauth-demo --tail=200
```
