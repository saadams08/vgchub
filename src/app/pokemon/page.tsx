import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { TYPE_COLORS } from "@/lib/utils";

type SearchParams = Promise<{ q?: string; type?: string }>;

export default async function PokemonPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = params.q ?? "";
  const typeFilter = params.type ?? "";

  const pokemon = await db.pokemon.findMany({
    orderBy: { dexNumber: "asc" },
    where: {
      ...(q ? { OR: [{ displayName: { contains: q } }, { name: { contains: q } }] } : {}),
    },
  });

  const filtered = typeFilter
    ? pokemon.filter((p: typeof pokemon[number]) => {
        const types: string[] = JSON.parse(p.types);
        return types.includes(typeFilter);
      })
    : pokemon;

  const allTypes = [
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
    "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
    "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Pokédex</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Browse all Pokémon in Pokémon Champions. Click a Pokémon to see recommended builds, items, and EV spreads.
      </p>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <form method="get" className="flex gap-2 w-full sm:w-auto">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search Pokémon..."
            className="h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="h-9 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/pokemon"
          className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
            !typeFilter ? "border-violet-500 bg-violet-500/20 text-violet-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
          }`}
        >
          All
        </Link>
        {allTypes.map((t) => (
          <Link
            key={t}
            href={`/pokemon?type=${t}${q ? `&q=${q}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
              typeFilter === t
                ? `${TYPE_COLORS[t]} text-white border-transparent`
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          No Pokémon found. The database may need to be seeded.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filtered.map((p: typeof pokemon[number]) => {
            const types: string[] = JSON.parse(p.types);
            const mainColor = TYPE_COLORS[types[0]] ?? "bg-zinc-700";
            return (
              <Link
                key={p.id}
                href={`/pokemon/${p.name}`}
                className="group flex flex-col items-center rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 hover:border-zinc-600 transition-colors"
              >
                <div className={`h-14 w-14 rounded-full ${mainColor}/20 flex items-center justify-center mb-2 overflow-hidden`}>
                  {p.spriteUrl ? (
                    <Image
                      src={p.spriteUrl}
                      alt={p.displayName}
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-zinc-500 text-xs">#{p.dexNumber}</span>
                  )}
                </div>
                <span className="text-xs text-zinc-500 mb-0.5">#{String(p.dexNumber).padStart(4, "0")}</span>
                <span className="text-xs font-medium text-zinc-200 text-center leading-tight group-hover:text-violet-400 transition-colors">
                  {p.displayName}
                </span>
                <div className="flex gap-1 mt-1.5 flex-wrap justify-center">
                  {types.map((t) => (
                    <span
                      key={t}
                      className={`${TYPE_COLORS[t] ?? "bg-zinc-600"} rounded px-1 text-white`}
                      style={{ fontSize: "9px" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
