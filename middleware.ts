import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  console.log("🔐 Token Middleware:", token)

  if (!token) {
    if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/admin')) {
      console.log("🔁 No token, redirect to /login")
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    console.log("✅ Decoded JWT:", payload)

    const role = payload.role

    if (req.nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN') {
      console.log("🚫 Not admin, redirecting to /dashboard")
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (req.nextUrl.pathname.startsWith('/dashboard') && role === 'ADMIN') {
      console.log("🚫 Admin trying to access user dashboard, redirecting to /admin")
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.log("❌ JWT error:", error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
