import { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    // We remove the centering and background here because 
    // the Page already handles it with Hyperspeed
    <div className="relative min-h-screen w-full">
      {children}
    </div>
  )
}