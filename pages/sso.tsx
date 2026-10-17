import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"

export default function SsoRedirectPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function beginSignIn() {
      const callbackUrl = `${window.location.origin}/nextauth`
      const result = await signIn("myauth", { redirect: false, callbackUrl })

      if (!active) return
      if (result?.url) {
        window.location.assign(result.url)
      } else {
        setError(result?.error || "OpenIssuer sign-in could not be started.")
      }
    }

    void beginSignIn().catch((reason: unknown) => {
      if (active) {
        setError(reason instanceof Error ? reason.message : "OpenIssuer sign-in failed.")
      }
    })

    return () => {
      active = false
    }
  }, [])

  return <p>{error || "Redirecting to OpenIssuer sign-in..."}</p>
}
