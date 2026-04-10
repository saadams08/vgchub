import Link from "next/link";
import { auth } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Swords, Menu } from "lucide-react";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <Swords className="h-6 w-6 text-violet-400" />
          <span>
            VGC<span className="text-violet-400">Hub</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/teams" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800 transition-colors">
            Teams
          </Link>
          <Link href="/teams?format=Singles" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800 transition-colors">
            Singles
          </Link>
          <Link href="/teams?format=Doubles" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800 transition-colors">
            Doubles
          </Link>
          <Link href="/pokemon" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800 transition-colors">
            Pokédex
          </Link>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/teams/new">
                <Button size="sm">+ New Team</Button>
              </Link>
              <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-100 px-2">
                {(user as { username?: string }).username ?? user.name ?? "Profile"}
              </Link>
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
