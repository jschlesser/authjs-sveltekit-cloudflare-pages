import { SvelteKitAuth } from "@auth/sveltekit"
import GitHub from "@auth/core/providers/github"
import type { Handle } from "@sveltejs/kit";
import { sequence } from '@sveltejs/kit/hooks';
import { D1Adapter, up } from "@jschlesser/d1-adapter"

// handle migrations
let migrated = false;

async function migrationHandle({event, resolve}) {

  if(!migrated) {
    try {
      await up(event.platform.env.DB)
      migrated = true
    } catch(e:any) {
      console.log(e.cause.message, e.message)
    }
  }
 return resolve(event)
}

// providers: [GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET })],
const authHandle = SvelteKitAuth(async (event) => {

  // need to configure authjs to use d1 adapater and a database session
  const  options = {
    providers: [GitHub({ clientId: event.platform.env.GITHUB_ID, clientSecret: event.platform.env.GITHUB_SECRET })],
    secret: event.platform.env.AUTH_SECRET,
    trustHost: true,
    adapter: new D1Adapter(event.platform.env.DB),
    session: {
      strategy: "database",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60 // wait atleast 24 hours before writing to the db to extend the age of the session (once per day) 
    }
  }
  return options
}) satisfies Handle;

async function dumbHandle({event, resolve}) {
  console.log('doing dumb handler')
  const res = await event.platform.env.DB.prepare('select 1;').first()
  console.log(res)
  return resolve(event)
}

export const handle = sequence( migrationHandle ,authHandle)


