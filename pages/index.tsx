import Layout from "../components/layout"
import Link from "next/link"
import { useSession } from "next-auth/react"

type ShowcaseConfig = {
  appName: string
  partnerName: string
  partnerUrl: string
}

export async function getServerSideProps() {
  return {
    props: {
      appName: process.env.NEXT_PUBLIC_APP_NAME || "OpenIssuer OIDC client",
      partnerName: process.env.NEXT_PUBLIC_SSO_PARTNER_NAME || "the other connected app",
      partnerUrl: process.env.NEXT_PUBLIC_SSO_PARTNER_URL || "",
    },
  }
}

export default function IndexPage({ appName, partnerName, partnerUrl }: ShowcaseConfig) {
  const { data: session } = useSession()

  return (
    <Layout>
      <p className="eyebrow">{appName}</p>
      <h1>One OpenIssuer login. Multiple connected apps.</h1>
      <p className="pageLead">
        This app is one half of a live Single Sign-On demonstration. Authenticate
        against the configured tenant issuer, then open {partnerName} and watch it
        reuse the same OpenIssuer session.
      </p>
      {session ? (
        <div className="notice ssoNotice">
          <strong>SSO session active</strong>
          <p>
            You are signed in as {session.user?.email || session.user?.name || "the current user"}.
            {partnerUrl ? <> Continue to <a href={partnerUrl}>{partnerName}</a> without signing in again.</> : null}
          </p>
        </div>
      ) : (
        <div className="notice ssoNotice">
          <strong>See SSO in action</strong>
          <p>Sign in above, then open the partner app using the same tenant issuer.</p>
        </div>
      )}
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
