import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { TYPE_COLORS, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ name: string }> };

const STAT_LABELS: Record<string, string> = {
  hp: "HP", attack: "Atk", defense: "Def",
  spAtk: "SpA", spDef: "SpD", speed: "Spe",
};

function StatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.round((value / 255) * 100));
  const color =
    value >= 100 ? "bg-green-500" : value >= 70 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-xs text-zinc-500 text-right">{label}</span>
      <span className="w-8 text-xs font-mono text-zinc-300">{value}</span>
      <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function PokemonDetailPage({ params }: Props) {
  const { name } = await params;

  const pokemon = await db.pokemon.findUnique({
    where: { name },
    include: {
      abilities: { include: { ability: true } },
      recommendations: {
        include: { author: { select: { username: true, name: true } } },
        orderBy: { upvotes: "desc" },
      },
    },
  });

  if (!pokemon) notFound();

  const session = await auth();
  const types: string[] = JSON.parse(pokemon.types);
  const stats = [
    { key: "hp", value: pokemon.hp },
    { key: "attack", value: pokemon.attack },
    { key: "defense", value: pokemon.defense },
    { key: "spAtk", value: pokemon.spAtk },
    { key: "spDef", value: pokemon.spDef },
    { key: "speed", value: pokemon.speed },
  ];
  const bst = stats.reduce((s, v) => s + v.value, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="flex items-center justify-center h-36 w-36 rounded-2xl border border-zinc-800 bg-zinc-900/60 shrink-0 mx-auto sm:mx-0 overflow-hidden">
          {pokemon.imageUrl ? (
            <Image src={pokemon.imageUrl} alt={pokemon.displayName} width={144} height={144} className="object-contain" />
          ) : (
            <span className="text-zinc-600 text-sm">No image</span>
          )}
        </div>
        <div className="flex-1">
          <div className="text-zinc-500 text-sm mb-1">#{String(pokemon.dexNumber).padStart(4, "0")}</div>
          <h1 className="text-3xl font-bold text-white mb-2">{pokemon.displayName}</h1>
          <div className="flex gap-2 mb-3">
            {types.map((t) => (
              <span key={t} className={`${TYPE_COLORS[t] ?? "bg-zinc-600"} rounded-full px-3 py-1 text-sm font-semibold text-white`}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-200">Base Stats</h2>
          <span className="text-sm text-zinc-500">BST: <span className="text-zinc-300 font-semibold">{bst}</span></span>
        </div>
        <div className="space-y-2">
          {stats.map(({ key, value }) => (
            <StatBar key={key} label={STAT_LABELS[key]} value={value} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Community Builds & Spreads</h2>
          {session?.user && (
            <Link href={`/pokemon/${pokemon.name}/recommend`}>
              <Button size="sm">+ Add Build</Button>
            </Link>
          )}
        </div>

        {pokemon.recommendations.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <p className="mb-3">No builds submitted yet.</p>
            {session?.user ? (
              <Link href={`/pokemon/${pokemon.name}/recommend`}>
                <Button size="sm">Submit the first build</Button>
              </Link>
            ) : (
              <Link href="/login" className="text-violet-400 hover:underline text-sm">
                Sign in to submit a build
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {pokemon.recommendations.map((rec: typeof pokemon.recommendations[number]) => {
              const moves: string[] = JSON.parse(rec.moves);
              const totalEvs = rec.evHp + rec.evAtk + rec.evDef + rec.evSpAtk + rec.evSpDef + rec.evSpeed;
              return (
                <div key={rec.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-zinc-100">{rec.title}</h3>
                      <div className="flex gap-2 text-xs text-zinc-500 mt-0.5">
                        <span>{rec.format}</span>
                        <span>·</span>
                        <span>by {rec.author.username ?? rec.author.name}</span>
                        <span>·</span>
                        <span>{formatDate(rec.createdAt)}</span>
                      </div>
                    </div>
                    <span className="text-sm text-zinc-400">▲ {rec.upvotes}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Moves</div>
                      <ul className="space-y-0.5">
                        {moves.map((m, i) => <li key={i} className="text-zinc-300">{m}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Details</div>
                      <div className="space-y-0.5 text-zinc-300">
                        <div><span className="text-zinc-500">Item:</span> {rec.itemName ?? "—"}</div>
                        <div><span className="text-zinc-500">Ability:</span> {rec.abilityName ?? "—"}</div>
                        <div><span className="text-zinc-500">Nature:</span> {rec.nature ?? "—"}</div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-zinc-500 mb-1">EVs ({totalEvs}/510)</div>
                      <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 text-xs">
                        {[
                          ["HP", rec.evHp], ["Atk", rec.evAtk], ["Def", rec.evDef],
                          ["SpA", rec.evSpAtk], ["SpD", rec.evSpDef], ["Spe", rec.evSpeed],
                        ].map(([label, val]) => (
                          <div key={label as string} className="flex justify-between">
                            <span className="text-zinc-500">{label}</span>
                            <span className={Number(val) > 0 ? "text-violet-300 font-semibold" : "text-zinc-700"}>
                              {val}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {rec.description && (
                    <p className="mt-3 pt-3 border-t border-zinc-800 text-sm text-zinc-400">
                      {rec.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
