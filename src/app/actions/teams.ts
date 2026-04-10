"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const slotSchema = z.object({
  pokemonId: z.string(),
  slotIndex: z.number().int().min(0).max(5),
  nickname: z.string().optional(),
  ability: z.string().optional(),
  itemName: z.string().optional(),
  nature: z.string().optional(),
  moves: z.array(z.string()).max(4),
  evHp: z.number().int().min(0).max(252).default(0),
  evAtk: z.number().int().min(0).max(252).default(0),
  evDef: z.number().int().min(0).max(252).default(0),
  evSpAtk: z.number().int().min(0).max(252).default(0),
  evSpDef: z.number().int().min(0).max(252).default(0),
  evSpeed: z.number().int().min(0).max(252).default(0),
  notes: z.string().optional(),
});

const teamSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(2000).optional(),
  format: z.enum(["Singles", "Doubles"]),
  archetype: z.string().optional(),
  isPublic: z.boolean().default(true),
  rentalCode: z.string().max(10).optional(),
  slots: z.array(slotSchema).min(1).max(6),
});

type TeamFormState = {
  errors?: Record<string, string[] | string>;
  message?: string;
  teamId?: string;
};

export async function createTeam(data: z.infer<typeof teamSchema>): Promise<TeamFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "You must be logged in" };

  const parsed = teamSchema.safeParse(data);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { title, description, format, archetype, isPublic, rentalCode, slots } = parsed.data;

  // Validate total EVs per slot <= 510
  for (const slot of slots) {
    const total = slot.evHp + slot.evAtk + slot.evDef + slot.evSpAtk + slot.evSpDef + slot.evSpeed;
    if (total > 510) {
      return { message: `EV total for slot ${slot.slotIndex + 1} exceeds 510` };
    }
  }

  const team = await db.teamBuild.create({
    data: {
      title,
      description,
      format,
      archetype,
      isPublic,
      rentalCode: rentalCode || null,
      authorId: session.user.id,
      slots: {
        create: slots.map((s) => ({
          slotIndex: s.slotIndex,
          pokemonId: s.pokemonId,
          nickname: s.nickname,
          ability: s.ability,
          itemName: s.itemName,
          nature: s.nature,
          moves: JSON.stringify(s.moves),
          evHp: s.evHp,
          evAtk: s.evAtk,
          evDef: s.evDef,
          evSpAtk: s.evSpAtk,
          evSpDef: s.evSpDef,
          evSpeed: s.evSpeed,
          notes: s.notes,
        })),
      },
    },
  });

  revalidatePath("/teams");
  return { teamId: team.id };
}

export async function deleteTeam(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const team = await db.teamBuild.findUnique({ where: { id: teamId } });
  if (!team || team.authorId !== session.user.id) throw new Error("Forbidden");

  await db.teamBuild.delete({ where: { id: teamId } });
  revalidatePath("/teams");
  redirect("/dashboard");
}

export async function voteTeam(teamId: string, value: 1 | -1) {
  const session = await auth();
  if (!session?.user?.id) return { message: "Login to vote" };

  const existing = await db.vote.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });

  if (existing) {
    if (existing.value === value) {
      await db.vote.delete({ where: { id: existing.id } });
    } else {
      await db.vote.update({ where: { id: existing.id }, data: { value } });
    }
  } else {
    await db.vote.create({ data: { userId: session.user.id, teamId, value } });
  }

  revalidatePath(`/teams/${teamId}`);
}

export async function addComment(teamId: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) return { message: "Login to comment" };
  if (!body.trim()) return { message: "Comment cannot be empty" };

  await db.comment.create({
    data: { body: body.trim(), authorId: session.user.id, teamId },
  });

  revalidatePath(`/teams/${teamId}`);
}
