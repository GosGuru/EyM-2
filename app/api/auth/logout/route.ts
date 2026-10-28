import { NextResponse } from "next/server";
import { signOutAdmin } from "../../../../lib/supabase/auth";

export async function POST() {
  await signOutAdmin();
  return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}
