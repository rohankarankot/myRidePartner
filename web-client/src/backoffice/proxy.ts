import { auth } from '@bo/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isAuthPage = nextUrl.pathname.startsWith('/backoffice/auth');
  const isDashboardPage = nextUrl.pathname.startsWith('/backoffice/dashboard');

  if (isDashboardPage) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/backoffice/auth/signin', nextUrl));
    }
    if ((req.auth?.user as any)?.role !== 'SUPER_ADMIN') {
      return Response.redirect(new URL('/backoffice/auth/signin?error=AccessDenied', nextUrl));
    }
  }

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL('/backoffice/dashboard/overview', nextUrl));
  }

  return null;
});

export const config = {
  matcher: ['/backoffice/:path*'],
};
