import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization')

  if (request.nextUrl.pathname.startsWith('/setup') || 
      request.nextUrl.pathname.startsWith('/api/sources')) {
    if (!basicAuth) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }

    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    if (user !== process.env.BASIC_AUTH_USER || pwd !== process.env.BASIC_AUTH_PASSWORD) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/setup/:path*', '/api/sources/:path*'],
}