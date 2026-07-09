import Link from "next/link"
import styles from "./footer.module.css"

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <span>OpenIssuer NextAuth client</span>
        <nav aria-label="Supporting links">
          <a href="https://openissuer.com/docs">Docs</a>
          <a href="https://github.com/sonamsamdupkhangsar/next-auth-example">Source</a>
          <Link href="/policy">Policy</Link>
        </nav>
      </div>
    </footer>
  )
}
