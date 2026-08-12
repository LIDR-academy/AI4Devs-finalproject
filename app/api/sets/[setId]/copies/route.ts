import { requireSession } from "@/http/auth-context";
import { toProblemResponse } from "@/http/problem";
import { prismaCopyRepository } from "@/repositories/copy.repository.prisma";
import { prismaSetRepository } from "@/repositories/set.repository.prisma";
import { addCopy, listCopiesOfSet } from "@/use-cases/copies/manage-copies";

function deps() {
  return { copies: prismaCopyRepository, sets: prismaSetRepository };
}

/** Copias de un Set con su estado. Vista de back-office: no es la pública. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId } = await params;
  try {
    const { user } = await requireSession();
    const copies = await listCopiesOfSet(deps(), {
      setId,
      actor: { id: user.id, role: user.role },
    });
    return Response.json({ copies });
  } catch (error) {
    return toProblemResponse(error, `/api/sets/${setId}/copies`);
  }
}

/** Alta de una copia física. Nace en INTAKE; catalogarla es la transición siguiente. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId } = await params;
  try {
    const { user } = await requireSession();
    const copy = await addCopy(deps(), { setId, actor: { id: user.id, role: user.role } });
    return Response.json({ copy }, { status: 201 });
  } catch (error) {
    return toProblemResponse(error, `/api/sets/${setId}/copies`);
  }
}
