import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/guards";
import { PinLoginForm } from "@/components/forms/PinLoginForm";

export default async function ProfilePinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdult();
  const { id } = await params;

  const profile = await prisma.studentProfile.findUnique({ where: { id } });
  if (!profile) notFound();

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-4">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
        style={{ background: "var(--color-accent)" }}
        aria-hidden
      >
        🧒
      </div>
      <h1 className="text-2xl font-bold">Hola, {profile.displayName}</h1>
      <PinLoginForm profileId={profile.id} />
    </main>
  );
}
