/**
 * Autorização das rotas /api/vendedor/*: exige sessão com papel
 * "restaurante" e resolve o restaurante do dono.
 */
import { getSession } from "./auth";
import { getRestaurantByOwner } from "./db/queries";

export async function requireVendedorRestaurant() {
  const session = await getSession();
  if (!session || session.role !== "restaurante") {
    return {
      error: Response.json({ message: "Acesso negado." }, { status: 403 }),
      restaurant: null,
    } as const;
  }
  const restaurant = await getRestaurantByOwner(Number(session.sub));
  if (!restaurant) {
    return {
      error: Response.json(
        { message: "Restaurante não encontrado." },
        { status: 404 }
      ),
      restaurant: null,
    } as const;
  }
  return { error: null, restaurant } as const;
}
