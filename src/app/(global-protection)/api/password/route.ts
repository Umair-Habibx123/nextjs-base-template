import { NextResponse } from "next/server";
import { signToken } from "@/utils/protect";
import { getGlobalSettings } from "@/utils/getGlobalSettings";

export const POST = async (req: Request) => {
  const { password } = await req.json();
  const settings = await getGlobalSettings();

  const correct = settings.site_password;

  if (!correct || password !== correct) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const token = signToken("granted", req);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("site_access", token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
  });

  return res;
};
