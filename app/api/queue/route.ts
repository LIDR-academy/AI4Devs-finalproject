import { requireSession } from "@/http/auth-context";
import { toProblemResponse } from "@/http/problem";
import { prismaQueueRepository } from "@/repositories/queue.repository.prisma";

/** Colas en las que está el usuario en sesión. */
export async function GET() {
  try {
    const { user } = await requireSession();
    const entries = await prismaQueueRepository.listEntriesForUser(user.id);
    return Response.json({ entries });
  } catch (error) {
    return toProblemResponse(error, "/api/queue");
  }
}
