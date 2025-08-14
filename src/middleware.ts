import { createClient } from './lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('pathname=============', pathname);

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/callback', '/auth/employer/login', '/auth/talent/login']
  if (publicRoutes.some(route => pathname === route)) {
    console.log('public route');
    return NextResponse.next()
  }

  // Check if the user is authenticated
  const { supabase } = createClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  // Handle unauthenticated users
  if (!user) {
    // Use replace: true for smoother redirects without adding to history
    return NextResponse.redirect(new URL('/', request.url), { status: 302 })
  }

  // Role-based route protection
  // if (pathname.startsWith('/talent') && userRole !== Role.TALENT) {
  //   return NextResponse.redirect(new URL('/', request.url), { status: 302 })
  // }

  // if (pathname.startsWith('/employer') && userRole !== Role.EMPLOYER) {
  //   return NextResponse.redirect(new URL('/auth/employer/login', request.url), { status: 302 })
  // }

  return NextResponse.next()
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - auth/callback (auth callback route)
     * Also skip any path that looks like a file (e.g., .svg, .png, .css, .js)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|auth/callback|.*\\..*).*)',
  ],
}