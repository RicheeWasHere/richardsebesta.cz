import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['cs', 'en'];
const defaultLocale = 'cs';

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;

  // Standalone iframe widget: skip locale routing and allow embedding from any origin.
  if (pathname === '/bio-widget.html') {
    const response = NextResponse.next();
    response.headers.set('Content-Security-Policy', 'frame-ancestors *');
    response.headers.delete('X-Frame-Options');
    return response;
  }
  
  // Skip public files and api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('/api/') ||
    pathname.match(/\.(.*)$/) // e.g. .ico, .png
  ) {
    return NextResponse.next();
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const headerLang = request.headers.get('accept-language') || '';
    // simple check to route to English if not somewhat matching Czech
    const isCzech = headerLang.includes('cs') || headerLang.includes('sk');
    const locale = isCzech ? 'cs' : 'en';

    // e.g. incoming request is /about
    // The new URL is now /en/about
    return NextResponse.redirect(
      new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
    );
  }
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`. bio-widget.html is handled above
  // so it is not locale-redirected; keep it in the matcher to set embed headers.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
