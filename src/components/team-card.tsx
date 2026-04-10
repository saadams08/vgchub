import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { formatDate, getVoteCount, TYPE_COLORS } from "@/lib/utils";

type TeamWithRelations = {
  id: string;
  title: string;
  format: string;
  archetype: string | null;
  createdAt: Date;
  author: { username: string | null; name: string | null; image: string | null };
  slots: {
    slotIndex: number;
    pokemon: {
      name: string;
      displayName: string;
      types: string;
      spriteUrl: string | null;
    };
  }[];
  votes: { value: number }[];
  _count: { comments: number };
};

export function TeamCard({ team }: { team: TeamWithRelations }) {
  const voteCount = getVoteCount(team.votes);
  const authorName = team.author.username ?? team.author.name ?? "Unknown";

  return (
    <Link href={`/teams/${team.id}`} className="group block">
      <Card className="h-full hover:border-zinc-600 transition-colors group-hover:bg-zinc-900/80">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 group-hover:text-violet-400 transition-colors">
              {team.title}
            </CardTitle>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                team.format === "Doubles"
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-violet-500/20 text-violet-300"
              }`}
            >
              {team.format}
            </span>
          </div>
          {team.archetype && (
            <Badge variant="outline" className="w-fit text-xs">
              {team.archetype}
            </Badge>
          )}
        </CardHeader>

        <CardContent>
          {/* Pokemon sprites row */}
          <div className="flex gap-1.5 mb-3">
            {team.slots
              .sort((a, b) => a.slotIndex - b.slotIndex)
              .map((slot) => {
                const types: string[] = JSON.parse(slot.pokemon.types);
                const typeColor = TYPE_COLORS[types[0]] ?? "bg-zinc-600";
                return (
                  <div
                    key={slot.slotIndex}
                    className={`relative h-10 w-10 rounded-full ${typeColor}/20 border border-zinc-700 flex items-center justify-center overflow-hidden`}
                    title={slot.pokemon.displayName}
                  >
                    {slot.pokemon.spriteUrl ? (
                      <Image
                        src={slot.pokemon.spriteUrl}
                        alt={slot.pokemon.displayName}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-xs text-zinc-400">
                        {slot.pokemon.displayName.slice(0, 2)}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>

          <p className="text-xs text-zinc-500">by {authorName}</p>
        </CardContent>

        <CardFooter className="pt-0 text-xs text-zinc-500 gap-4">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            {voteCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {team._count.comments}
          </span>
          <span className="ml-auto">{formatDate(team.createdAt)}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
