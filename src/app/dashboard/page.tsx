import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TeamCard } from "@/components/team-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { deleteTeam } from "@/app/actions/teams";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      teams: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { username: true, name: true, image: true } },
          slots: {
            include: { pokemon: true },
            orderBy: { slotIndex: "asc" },
          },
          votes: true,
          _count: { select: { comments: true } },
        },
      },
    },
  });

  if (!user) redirect("/login");

  const username = user.username ?? user.name ?? "Trainer";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{username}&apos;s Dashboard</h1>
          <p className="text-zinc-400 text-sm">{user.email}</p>
        </div>
        <Link href="/teams/new">
          <Button>+ New Team</Button>
        </Link>
      </div>

      <h2 className="text-lg font-semibold text-zinc-200 mb-4">
        Your Teams ({user.teams.length})
      </h2>

      {user.teams.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-500">
          <p className="mb-4">You haven&apos;t shared any teams yet.</p>
          <Link href="/teams/new">
            <Button>Share Your First Team</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {user.teams.map((team: (typeof user.teams)[number]) => (
            <div key={team.id} className="relative">
              <TeamCard team={team} />
              <div className="absolute top-3 right-3 flex gap-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    team.isPublic ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"
                  }`}
                >
                  {team.isPublic ? "Public" : "Private"}
                </span>
                <form
                  action={async () => {
                    "use server";
                    await deleteTeam(team.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
