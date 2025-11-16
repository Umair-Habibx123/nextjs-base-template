import { NextResponse } from "next/server";
import { signToken } from "@/utils/protect";

export const POST = async (req: Request) => {
  const { password } = await req.json();
  const correct = process.env.SITE_PASSWORD || "demo123";

  if (password !== correct)
    return new NextResponse("Unauthorized", { status: 401 });

  // const token = signToken("granted");
  const token = signToken("granted", req);


  const res = NextResponse.json({ ok: true });

  res.cookies.set("site_access", token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    secure: process.env.NODE_ENV === "production", // FIX
    maxAge: 60 * 60 * 24,
  });

  return res;
};
