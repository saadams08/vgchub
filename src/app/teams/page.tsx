import Link from "next/link";
import { db } from "@/lib/db";
import { TeamCard } from "@/components/team-card";
import { Button } from "@/components/ui/button";
import { ARCHETYPES } from "@/lib/utils";

type SearchParams = Promise<{
  format?: string;
  archetype?: string;
  q?: string;
  page?: string;
}>;

const PAGE_SIZE = 12;

export default async function TeamsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const format = params.format;
  const archetype = params.archetype;
  const q = params.q;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where = {
    isPublic: true,
    ...(format ? { format } : {}),
    ...(archetype ? { archetype } : {}),
    ...(q ? { title: { contains: q } } : {}),
  };

  const [teams, total] = await Promise.all([
    db.teamBuild.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        author: { select: { username: true, name: true, image: true } },
        slots: {
          include: { pokemon: true },
          orderBy: { slotIndex: "asc" },
        },
        votes: true,
        _count: { select: { comments: true } },
      },
    }),
    db.teamBuild.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { format, archetype, q, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    return `/teams?${p.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          {format ? `${format} Teams` : "All Teams"}
          <span className="ml-2 text-base font-normal text-zinc-500">({total})</span>
        </h1>
        <Link href="/teams/new">
          <Button>+ Share Team</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {/* Format filter */}
        <Link href={buildUrl({ format: undefined, page: undefined })}>
          <span className={`px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer ${!format ? "border-violet-500 bg-violet-500/20 text-violet-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
            All
          </span>
        </Link>
        {["Singles", "Doubles"].map((f) => (
          <Link key={f} href={buildUrl({ format: f, page: undefined })}>
            <span className={`px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer ${format === f ? "border-violet-500 bg-violet-500/20 text-violet-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
              {f}
            </span>
          </Link>
        ))}

        <div className="w-px bg-zinc-700 mx-1" />

        {/* Archetype filter */}
        {ARCHETYPES.map((a) => (
          <Link key={a} href={buildUrl({ archetype: archetype === a ? undefined : a, page: undefined })}>
            <span className={`px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer ${archetype === a ? "border-blue-500 bg-blue-500/20 text-blue-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
              {a}
            </span>
          </Link>
        ))}
      </div>

      {/* Teams grid */}
      {teams.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="mb-4">No teams found.</p>
          <Link href="/teams/new">
            <Button>Be the first to share one</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team: (typeof teams)[number]) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link href={buildUrl({ page: String(page - 1) })}>
              <Button variant="outline" size="sm">← Prev</Button>
            </Link>
          )}
          <span className="flex items-center px-3 text-sm text-zinc-400">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={buildUrl({ page: String(page + 1) })}>
              <Button variant="outline" size="sm">Next →</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
