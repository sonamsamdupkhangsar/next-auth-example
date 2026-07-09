import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import styles from "./header.module.css"

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  return (
    <header className={styles.header}>
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}>OI</span>
          <span>
            <strong>OpenIssuer</strong>
            <small>OIDC client</small>
          </span>
        </Link>
        <div className={styles.sessionStatus}>
          <div className={!session && loading ? styles.loading : styles.loaded}>
            {!session && !loading && <span className={styles.statusText}>Signed out</span>}
            {session?.user && (
              <span className={styles.userIdentity}>
                {session.user.image && (
                  <span
                    style={{ backgroundImage: `url('${session.user.image}')` }}
                    className={styles.avatar}
                  />
                )}
                <span>
                  <small>Signed in</small>
                  <strong>{session.user.name || session.user.email}</strong>
                </span>
              </span>
            )}
            {!session && !loading && (
              <a
                href="/api/auth/signin"
                className={styles.buttonPrimary}
                onClick={(event) => {
                  event.preventDefault()
                  signIn("myauth")
                }}
              >
                Sign in
              </a>
            )}
            {session?.user && (
              <a
                href="/api/auth/signout"
                className={styles.button}
                onClick={(event) => {
                  event.preventDefault()
                  signOut()
                }}
              >
                Sign out
              </a>
            )}
          </div>
        </div>
      </div>
      <nav className={styles.navigation} aria-label="Client views">
        <ul className={styles.navItems}>
          <li className={styles.navItem}>
            <Link href="/">Home</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/client">Client session</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/server">Server session</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/protected">Protected</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/api-example">API responses</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/me">Identity</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
