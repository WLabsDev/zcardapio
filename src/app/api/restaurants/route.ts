import { listActiveRestaurants } from "@/lib/db/queries";

export async function GET() {
  return Response.json({ restaurants: await listActiveRestaurants() });
}
