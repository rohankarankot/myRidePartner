import backofficeProxy from '@bo/proxy';

export default backofficeProxy;
export const config = {
  matcher: ['/backoffice/:path*'],
};
