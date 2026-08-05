import { prisma } from "@/lib/prisma";
import {
  getCachedData,
  setCachedData,
  cacheKeys,
  CacheTTL,
} from "@/lib/redis/cache";

export type GroupMembership = {
  id: string;
  userId: string;
  groupId: string;
};

export async function getGroupMembership(
  userId: string,
  groupId: string,
): Promise<GroupMembership | null> {
  try {
    if (!userId || !groupId) return null;

    const key = cacheKeys.groupMembership(userId, groupId);

    const cached = await getCachedData<GroupMembership>(key);
    if (cached) return cached;

    const dbInfo = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      select: {
        id: true,
        userId: true,
        groupId: true,
      },
    });

    if (!dbInfo) {
      return null;
    }

    await setCachedData(key, dbInfo, CacheTTL.groupMembership);
    return dbInfo;
  } catch (error) {
    console.error("Error in getGroupMembership:", error);
    return null;
  }
}
