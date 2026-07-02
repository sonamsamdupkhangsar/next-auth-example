import { useSession } from "next-auth/react"
import Layout from "../components/layout"

export default function MePage() {
  const { data: session, status } = useSession()
  const claims = session?.claims || {}

  return (
    <Layout>
      <p className="eyebrow">Current identity</p>
      <h1>Signed-in user</h1>
      <dl className="identityList">
        <dt>Status</dt>
        <dd>{status}</dd>
        <dt>Name</dt>
        <dd>{session?.user?.name || ""}</dd>
        <dt>Email</dt>
        <dd>{session?.user?.email || ""}</dd>
        <dt>Issuer</dt>
        <dd>{String(session?.issuer || "")}</dd>
        <dt>Subject</dt>
        <dd>{String(claims.sub || "")}</dd>
        <dt>Tenant</dt>
        <dd>{String(claims.tenant_id || "")}</dd>
      </dl>

      <h2>Token claims</h2>
      <pre className="codePanel">{JSON.stringify(claims, null, 2)}</pre>
    </Layout>
  )
}
