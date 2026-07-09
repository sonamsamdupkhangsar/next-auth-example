import Layout from "../components/layout"
import Link from "next/link"

export default function IndexPage() {
  return (
    <Layout>
      <p className="eyebrow">Tenant OIDC client</p>
      <h1>OpenIssuer sign-in, tokens, and session data.</h1>
      <p className="pageLead">
        Authenticate against the configured tenant issuer and inspect the identity
        returned to this NextAuth application.
      </p>
      <div className="featureGrid">
        <Link href="/me" className="featureItem">
          <strong>Identity</strong>
          <span>Issuer, subject, tenant, and claims</span>
        </Link>
        <Link href="/client" className="featureItem">
          <strong>Client session</strong>
          <span>Session state from the browser</span>
        </Link>
        <Link href="/server" className="featureItem">
          <strong>Server session</strong>
          <span>Session state rendered on the server</span>
        </Link>
        <Link href="/api-example" className="featureItem">
          <strong>API responses</strong>
          <span>Session and JSON Web Token endpoints</span>
        </Link>
      </div>
    </Layout>
  )
}
