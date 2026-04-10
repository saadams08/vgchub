import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatDate, getVoteCount, TYPE_COLORS, NATURES } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { VoteButtons } from "@/components/vote-buttons";
import { CommentSection } from "@/components/comment-section";
import Image from "next/image";

type Props = { params: Promise<{ id: string }> };

export default async function TeamPage({ params }: Props) {
  const { id } = await params;

  const team = await db.teamBuild.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, name: true, image: true } },
      slots: {
        include: { pokemon: { include: { abilities: { include: { ability: true } } } } },
        orderBy: { slotIndex: "asc" },
      },
      comments: {
        include: { author: { select: { username: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      votes: true,
    },
  });

  if (!team || !team.isPublic) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  const userVote = team.votes.find((v: { userId: string; value: number }) => v.userId === userId)?.value ?? 0;
  const voteCount = getVoteCount(team.votes);
  const authorName = team.author.username ?? team.author.name ?? "Unknown";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-3xl font-bold text-white">{team.title}</h1>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
              team.format === "Doubles"
                ? "bg-blue-500/20 text-blue-300"
                : "bg-violet-500/20 text-violet-300"
            }`}
          >
            {team.format}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {team.archetype && <Badge>{team.archetype}</Badge>}
        </div>

        {team.description && (
          <p className="text-zinc-400 whitespace-pre-line mb-4">{team.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <span>by <span className="text-zinc-300">{authorName}</span></span>
          <span>{formatDate(team.createdAt)}</span>
          <VoteButtons teamId={team.id} voteCount={voteCount} userVote={userVote} />
        </div>
      </div>

      {/* Slots */}
      <div className="grid gap-4 mb-10">
        {team.slots.map((slot: typeof team.slots[number]) => {
          const types: string[] = JSON.parse(slot.pokemon.types);
          const moves: string[] = JSON.parse(slot.moves);
          const totalEvs =
            slot.evHp + slot.evAtk + slot.evDef + slot.evSpAtk + slot.evSpDef + slot.evSpeed;

          return (
            <div
              key={slot.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
            >
              {/* Pokemon header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative h-16 w-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                  {slot.pokemon.spriteUrl ? (
                    <Image
                      src={slot.pokemon.spriteUrl}
                      alt={slot.pokemon.displayName}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-zinc-500 text-sm">?</span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-lg text-white">
                    {slot.nickname ? (
                      <>
                        {slot.nickname}{" "}
                        <span className="text-zinc-500 font-normal text-base">
                          ({slot.pokemon.displayName})
                        </span>
                      </>
                    ) : (
                      slot.pokemon.displayName
                    )}
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {types.map((t) => (
                      <span
                        key={t}
                        className={`${TYPE_COLORS[t] ?? "bg-zinc-600"} rounded px-2 py-0.5 text-xs font-semibold text-white`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {/* Moves */}
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Moves</div>
                  <ul className="space-y-1">
                    {moves.map((m, i) => (
                      <li key={i} className="text-zinc-200">{m || <span className="text-zinc-600">—</span>}</li>
                    ))}
                  </ul>
                </div>

                {/* Details */}
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Details</div>
                  <div className="space-y-1 text-zinc-300">
                    <div><span className="text-zinc-500">Item:</span> {slot.itemName ?? "—"}</div>
                    <div><span className="text-zinc-500">Ability:</span> {slot.ability ?? "—"}</div>
                    <div><span className="text-zinc-500">Nature:</span> {slot.nature ?? "—"}</div>
                    <div><span className="text-zinc-500">Level:</span> {slot.level}</div>
                  </div>
                </div>

                {/* EVs */}
                <div className="col-span-2">
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1.5">
                    EVs <span className="normal-case">({totalEvs}/510)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
                    {[
                      ["HP", slot.evHp],
                      ["Atk", slot.evAtk],
                      ["Def", slot.evDef],
                      ["SpA", slot.evSpAtk],
                      ["SpD", slot.evSpDef],
                      ["Spe", slot.evSpeed],
                    ].map(([label, val]) => (
                      <div key={label as string} className="flex justify-between">
                        <span className="text-zinc-500">{label}</span>
                        <span className={Number(val) > 0 ? "text-violet-300 font-semibold" : "text-zinc-600"}>
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {slot.notes && (
                <div className="mt-3 pt-3 border-t border-zinc-800 text-sm text-zinc-400">
                  {slot.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comments */}
      <CommentSection teamId={team.id} comments={team.comments} userId={userId} />
    </div>
  );
}
