import { NextResponse, NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  if (
    !req.nextUrl.basePath.length &&
    !req.nextUrl.pathname.includes('/api') &&
    !req.nextUrl.pathname.includes('/tutors') &&
    !req.nextUrl.pathname.includes('/users')
  ) {
    const url = req.nextUrl.clone();
    return NextResponse.redirect(`${url.protocol}/${url.host}/tutors`);
  }
  return NextResponse.next();
}
