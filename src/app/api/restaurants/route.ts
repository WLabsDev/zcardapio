import { listActiveRestaurants } from "@/lib/db/queries";
import { apiHandler } from "@/lib/api";

export const GET = apiHandler(async () => {
  return Response.json({ restaurants: await listActiveRestaurants() });
});
