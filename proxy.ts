import { NextRequest, NextResponse } from "next/server"

// Next.js 16: middleware.ts → proxy.ts, export renamed to `proxy`
export function proxy(request: NextRequest) {
  const token = request.cookies.get("navy_token")?.value
  const pathname = request.nextUrl.pathname

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/applications") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/documents") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/calendar")

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
}
