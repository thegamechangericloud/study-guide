"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";

export async function markAllNotificationsRead() {
  const session = await requireAdult();
  await prisma.notification.updateMany({
    where: { userId: session.sub, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/parent");
}
