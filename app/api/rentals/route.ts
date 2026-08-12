import { requireSession } from "@/http/auth-context";
import { toProblemResponse } from "@/http/problem";
import { prismaRentalRepository } from "@/repositories/rental.repository.prisma";

/** Alquileres del usuario en sesión. `?active=1` deja solo los que siguen en curso. */
export async function GET(request: Request) {
  try {
    const { user } = await requireSession();
    const activeOnly = new URL(request.url).searchParams.get("active") === "1";

    const rentals = await prismaRentalRepository.listForUser(user.id, { activeOnly });
    return Response.json({ rentals });
  } catch (error) {
    return toProblemResponse(error, "/api/rentals");
  }
}
