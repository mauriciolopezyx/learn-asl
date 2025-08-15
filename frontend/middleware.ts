import { NextRequest, NextResponse } from "next/server";
 
export async function middleware(request: NextRequest) {
	const sessionCookie = request.cookies.get("SESSION")?.value
 
    // THIS IS NOT SECURE!
    // TODO: Create DAL layer (or rely on your authentication in Spring Boot)
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
 
	return NextResponse.next();
}
 
export const config = {
	matcher: ["/lessons"]
}