"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Swords } from "lucide-react";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white mb-2">
            <Swords className="h-7 w-7 text-violet-400" />
            VGC<span className="text-violet-400">Hub</span>
          </Link>
          <p className="text-zinc-400 text-sm">Sign in to your account</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm text-zinc-400 mb-1.5 block">
                Email
              </label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div>
              <label htmlFor="password" className="text-sm text-zinc-400 mb-1.5 block">
                Password
              </label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>

            {state?.message && (
              <p className="text-red-400 text-sm">{state.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-violet-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
