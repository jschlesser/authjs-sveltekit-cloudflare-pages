declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface Platform {
			env: {
				GITHUB_ID: string;
				GITHUB_SECRET: string;
				AUTH_SECRET: string;
				DB: D1Database;
			}
		}
	}
}

export {}