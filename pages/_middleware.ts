import { NextResponse, NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  if (
    !req.nextUrl.basePath.length &&
    !req.nextUrl.pathname.includes('/') &&
    !req.nextUrl.pathname.includes('/api') &&
    !req.nextUrl.pathname.includes('/tutors') &&
    !req.nextUrl.pathname.includes('/signin') &&
    !req.nextUrl.pathname.includes('/users') &&
    !req.nextUrl.pathname.includes('/favicon')
  ) {
    const { protocol, host } = req.nextUrl.clone();
    return NextResponse.redirect(`${protocol}/${host}/tutors`);
  }
  return NextResponse.next();
}
