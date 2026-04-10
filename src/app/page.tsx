import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { TeamCard } from "@/components/team-card";
import { Swords, Users, Trophy, Zap } from "lucide-react";

export default async function HomePage() {
  const [recentTeams, totalTeams, totalUsers] = await Promise.all([
    db.teamBuild.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      take: 6,
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
    db.teamBuild.count({ where: { isPublic: true } }),
    db.user.count(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <section className="mb-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-400 mb-6">
          <Zap className="h-3.5 w-3.5" />
          Pokémon Champions competitive hub
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4">
          Build. Share. <span className="text-violet-400">Dominate.</span>
        </h1>
        <p className="mx-auto max-w-xl text-zinc-400 text-lg mb-8">
          The community hub for competitive Pokémon Champions. Browse top-ranked
          team builds, discover EV spreads, and share your own strategies for
          Singles and Doubles.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/teams">
            <Button size="lg">Browse Teams</Button>
          </Link>
          <Link href="/teams/new">
            <Button size="lg" variant="outline">
              + Share Your Team
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[
            { icon: Trophy, label: "Teams Shared", value: totalTeams },
            { icon: Users, label: "Members", value: totalUsers },
            { icon: Swords, label: "Formats", value: 2 },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <Icon className="h-5 w-5 text-violet-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Format quick links */}
      <section className="mb-12 grid grid-cols-2 gap-4">
        <Link
          href="/teams?format=Singles"
          className="group rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-violet-950/30 p-6 hover:border-violet-700 transition-colors"
        >
          <div className="text-2xl font-bold text-white mb-1">Singles</div>
          <p className="text-zinc-400 text-sm">6v6, bring 3 — classic 1v1 format</p>
          <span className="mt-4 inline-block text-violet-400 text-sm group-hover:underline">Browse Singles →</span>
        </Link>
        <Link
          href="/teams?format=Doubles"
          className="group rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-blue-950/30 p-6 hover:border-blue-700 transition-colors"
        >
          <div className="text-2xl font-bold text-white mb-1">Doubles</div>
          <p className="text-zinc-400 text-sm">6v6, bring 4 — VGC-style 2v2 format</p>
          <span className="mt-4 inline-block text-blue-400 text-sm group-hover:underline">Browse Doubles →</span>
        </Link>
      </section>

      {/* Recent teams */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recently Shared Teams</h2>
          <Link href="/teams" className="text-sm text-violet-400 hover:underline">
            View all →
          </Link>
        </div>
        {recentTeams.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="mb-4">No teams yet. Be the first to share one!</p>
            <Link href="/teams/new">
              <Button>Share a Team</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentTeams.map((team: (typeof recentTeams)[number]) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
