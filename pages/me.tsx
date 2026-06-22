import { useSession } from "next-auth/react"
import Layout from "../components/layout"

export default function MePage() {
  const { data: session, status } = useSession()
  const claims = session?.claims || {}

  return (
    <Layout>
      <h1>Signed-in User</h1>
      <dl>
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

      <h2>Claims</h2>
      <pre>{JSON.stringify(claims, null, 2)}</pre>
    </Layout>
  )
}
