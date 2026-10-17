# OpenIssuer SSO showcase

This repository powers two independent app deployments that use the same
OpenIssuer tenant issuer:

- `OpenIssuer Workspace` at `https://sso-workspace.openissuer.com/nextauth`
- `OpenIssuer Reports` at `https://sso-reports.openissuer.com/nextauth`

Both apps use `https://summit.openissuer.com/issuer`, but each has its own OAuth
client and callback URL. Sign in to one app, then open the partner link on its
home page. The second app should reuse the active OpenIssuer browser session.

Register two authorization-code OIDC clients in the Summit admin portal:

```text
https://sso-workspace.openissuer.com/nextauth/api/auth/callback/myauth
https://sso-reports.openissuer.com/nextauth/api/auth/callback/myauth
```

Store each client ID and secret in the Kubernetes secrets referenced by the
matching values file. The two apps must use different `NEXTAUTH_SECRET` values
and separate client credentials.
