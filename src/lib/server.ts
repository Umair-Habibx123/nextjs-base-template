"use server";

import { auth } from "@/lib/auth";

export async function getBackupCodes(userId: string) {
  try {
    const data = await auth.api.viewBackupCodes({
      body: { userId },
    });
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
