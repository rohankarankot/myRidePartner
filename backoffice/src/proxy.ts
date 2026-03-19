import { auth } from '@/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isAuthPage = nextUrl.pathname.startsWith('/auth');
  const isDashboardPage = nextUrl.pathname.startsWith('/dashboard');

  if (isDashboardPage) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/auth/signin', nextUrl));
    }
    if ((req.auth?.user as any)?.role !== 'SUPER_ADMIN') {
      return Response.redirect(new URL('/auth/signin?error=AccessDenied', nextUrl));
    }
  }

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL('/dashboard/overview', nextUrl));
  }

  return null;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico text-transform).*)'],
};
