import Header from "./header"
import Footer from "./footer"
import type { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="appShell">
      <Header />
      <main className="appMain">
        <div className="pageSurface">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
