"use client";

import { useState, useTransition } from "react";
import { addComment } from "@/app/actions/teams";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

type Comment = {
  id: string;
  body: string;
  createdAt: Date;
  author: { username: string | null; name: string | null; image: string | null };
};

export function CommentSection({
  teamId,
  comments,
  userId,
}: {
  teamId: string;
  comments: Comment[];
  userId?: string;
}) {
  const [body, setBody] = useState("");
  const [localComments, setLocalComments] = useState(comments);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!body.trim()) return;
    if (!userId) {
      setError("You must be logged in to comment.");
      return;
    }
    startTransition(async () => {
      const result = await addComment(teamId, body);
      if (result?.message) {
        setError(result.message);
      } else {
        setBody("");
        setError("");
      }
    });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">
        Comments ({localComments.length})
      </h2>

      {userId ? (
        <div className="mb-6">
          <Textarea
            placeholder="Share your thoughts on this team..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mb-2"
            rows={3}
          />
          {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
          <Button onClick={handleSubmit} disabled={isPending || !body.trim()}>
            {isPending ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      ) : (
        <p className="text-zinc-500 mb-6 text-sm">
          <a href="/login" className="text-violet-400 hover:underline">Sign in</a> to leave a comment.
        </p>
      )}

      <div className="space-y-4">
        {localComments.map((comment) => {
          const author = comment.author.username ?? comment.author.name ?? "Unknown";
          return (
            <div key={comment.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm text-zinc-200">{author}</span>
                <span className="text-xs text-zinc-600">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-zinc-300 whitespace-pre-line">{comment.body}</p>
            </div>
          );
        })}
        {localComments.length === 0 && (
          <p className="text-zinc-600 text-sm">No comments yet. Start the discussion!</p>
        )}
      </div>
    </div>
  );
}
