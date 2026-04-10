"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { voteTeam } from "@/app/actions/teams";
import { cn } from "@/lib/utils";

export function VoteButtons({
  teamId,
  voteCount,
  userVote,
}: {
  teamId: string;
  voteCount: number;
  userVote: number;
}) {
  const [optimisticCount, setOptimisticCount] = useState(voteCount);
  const [optimisticVote, setOptimisticVote] = useState(userVote);
  const [isPending, startTransition] = useTransition();

  function handleVote(value: 1 | -1) {
    const prev = optimisticVote;
    const newVote = prev === value ? 0 : value;
    setOptimisticVote(newVote);
    setOptimisticCount((c) => c - prev + newVote);
    startTransition(async () => { await voteTeam(teamId, value); });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors",
          optimisticVote === 1
            ? "text-violet-400 bg-violet-500/10"
            : "text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10"
        )}
      >
        <ThumbsUp className="h-4 w-4" />
        <span className="font-semibold">{optimisticCount}</span>
      </button>
      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors",
          optimisticVote === -1
            ? "text-red-400 bg-red-500/10"
            : "text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
        )}
      >
        <ThumbsDown className="h-4 w-4" />
      </button>
    </div>
  );
}
