import Layout from "../components/layout"

export default function IndexPage() {
  return (
    <Layout>
      <h1>OpenIssuer OAuth Client Test</h1>
      <p>
        Use this app to verify an OpenIssuer OAuth client against platform,
        free, business1, or business2 issuers.
      </p>
      <ul>
        <li>Register this app's callback URL in the issuer client settings.</li>
        <li>Set the selected issuer and client ID in the local environment.</li>
        <li>Sign in and open the Me page to inspect the returned claims.</li>
      </ul>
    </Layout>
  )
}
