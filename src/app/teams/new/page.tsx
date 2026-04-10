import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TeamBuilderForm } from "@/components/team-builder-form";

export default async function NewTeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?from=/teams/new");

  const pokemon = await db.pokemon.findMany({
    orderBy: { dexNumber: "asc" },
    select: {
      id: true,
      dexNumber: true,
      name: true,
      displayName: true,
      types: true,
      spriteUrl: true,
      abilities: { include: { ability: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Share Your Team</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Fill in your team details. You can type in moves, EVs, and items directly.
      </p>
      <TeamBuilderForm pokemon={pokemon} />
    </div>
  );
}
