import Layout from "../components/layout"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

export default function ApiExamplePage() {
  return (
    <Layout>
      <p className="eyebrow">Authenticated endpoints</p>
      <h1>API responses</h1>
      <p className="pageLead">Sign in to inspect the session and token responses.</p>
      <div className="responseSection">
        <h2>Session</h2>
        <code>{basePath}/api/examples/session</code>
        <iframe title="Session API response" src={`${basePath}/api/examples/session`} />
      </div>
      <div className="responseSection">
        <h2>JSON Web Token</h2>
        <code>{basePath}/api/examples/jwt</code>
        <iframe title="JWT API response" src={`${basePath}/api/examples/jwt`} />
      </div>
    </Layout>
  )
}
