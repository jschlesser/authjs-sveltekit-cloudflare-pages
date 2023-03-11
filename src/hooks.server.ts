import { SvelteKitAuth } from "@auth/sveltekit"
import GitHub from "@auth/core/providers/github"
import type { Handle } from "@sveltejs/kit";

// providers: [GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET })],
export const handle = SvelteKitAuth(async (event) => {
  // lets connect to the database and do something
  if(event.platform && event.platform.env) {
    const db = event.platform.env.DB
    const { results } = await db.prepare(
        "SELECT * FROM Customers WHERE CompanyName = ?"
      )
        .bind("Bs Beverages")
        .all();
    console.log(results)
  }
  const  options = {
    providers: [GitHub({ clientId: event.platform.env.GITHUB_ID, clientSecret: event.platform.env.GITHUB_SECRET })],
    secret: event.platform.env.AUTH_SECRET,
    trustHost: true
  }
  return options
}) satisfies Handle;


