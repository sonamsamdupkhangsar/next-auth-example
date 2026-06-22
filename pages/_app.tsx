import { SessionProvider } from "next-auth/react"
import "./styles.css"

import type { AppProps } from "next/app"
import type { Session } from "next-auth"

const authBasePath = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/auth`

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider basePath={authBasePath} session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
