import { signIn } from "next-auth/react"

export default function AccessDenied() {
  return (
    <div className="notice noticeError">
      <p className="eyebrow">Authentication required</p>
      <h1>Access Denied</h1>
      <p>
        <a
          href="/api/auth/signin"
          onClick={(e) => {
            e.preventDefault()
            signIn()
          }}
        >
          Sign in to continue
        </a>
      </p>
    </div>
  )
}
