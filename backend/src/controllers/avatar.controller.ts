import { randomUUID } from "crypto";
import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";
import { responseHandler } from "@/utils/apiResponse";
import { generateSeedsSchema } from "@/types/avatar.type";
import { buildAvatarUrl } from "@/constants/avatar";

const SEEDS_COUNT = 5;
const MAX_GENERATION_ATTEMPTS = 20;

export async function generateSeeds(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user?.id;

  if (!userId) {
    return responseHandler.sendError(reply, 401, "Unauthorized");
  }

  const parsed = generateSeedsSchema.safeParse(request.body);

  if (!parsed.success) {
    return responseHandler.sendError(reply, 400, "Invalid input", parsed.error);
  }

  const { style } = parsed.data;

  // Get seeds already used by ANY user for this style to avoid collisions
  const usedSeeds = await prisma.user.findMany({
    where: {
      avatarStyle: style,
      avatarSeed: { not: null },
    },
    select: { avatarSeed: true },
  });

  const usedSeedSet = new Set(
    usedSeeds.map((u) => u.avatarSeed).filter(Boolean),
  );

  const seeds: string[] = [];
  let attempts = 0;

  while (seeds.length < SEEDS_COUNT && attempts < MAX_GENERATION_ATTEMPTS) {
    const seed = randomUUID().replace(/-/g, "").slice(0, 12);
    if (!usedSeedSet.has(seed) && !seeds.includes(seed)) {
      seeds.push(seed);
    }
    attempts++;
  }

  const avatars = seeds.map((seed) => ({
    seed,
    url: buildAvatarUrl(style, seed),
  }));

  return responseHandler.sendSuccess(reply, 200, "Seeds generated", {
    style,
    avatars,
  });
}
