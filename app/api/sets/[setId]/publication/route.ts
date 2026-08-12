import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaSetRepository } from "@/repositories/set.repository.prisma";
import { publishSet, unpublishSet } from "@/use-cases/catalog/manage-sets";

const PublicationSchema = z.object({ published: z.boolean() });

/**
 * Publica o retira un Set del catálogo — solo admin.
 *
 * Un único endpoint con el estado deseado, en vez de `/publish` y `/unpublish`: la
 * operación es la misma —fijar la publicación— y así es idempotente por construcción.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId } = await params;
  try {
    const { user } = await requireSession();
    const { published } = await parseJsonBody(request, PublicationSchema);

    const deps = { repository: prismaSetRepository, audit: prismaAuditRepository };
    const actor = { id: user.id, role: user.role };

    const set = published
      ? await publishSet(deps, setId, actor)
      : await unpublishSet(deps, setId, actor);

    return Response.json({ set });
  } catch (error) {
    return toProblemResponse(error, `/api/sets/${setId}/publication`);
  }
}
