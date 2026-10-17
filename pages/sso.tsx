import { useEffect } from "react"
import { signIn } from "next-auth/react"

export default function SsoRedirectPage() {
  useEffect(() => {
    void signIn("myauth")
  }, [])

  return <p>Redirecting to OpenIssuer sign-in...</p>
}
