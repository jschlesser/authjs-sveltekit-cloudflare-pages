> This repository is a demo for building an AuthJS.dev authenticated site with SvelteKit and deployment on Cloudflare Pages using a D1(Alpha) database database adapter for the authjs.dev user and session store. It demonstrates this using a [GitHub OAuth application](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) as the authentication provider.

## Warning

This project depends on alpha database software.
It relies on a database adapter that has yet to be accepted to the next-auth repository. I't uses a temporary package published under my own scope @jschlesser/d1-adapter. Hopefully it goes away and becomes @auth/d1-adapter in the near future.
In short, it's a work in progress, but somewhat usable so I can gather feedback.

## Overview

This is adapted from the official SvelteKit Auth example for [Auth.js](https://sveltekit.authjs.dev) for Cloudflare Pages. It uses a D1 sqlite database which is in open alpha @ Cloudflare. The D1 database API is subject to change,
You probably don't want to build anything mission critical on it today. However, it's plenty stable enough for hobbys and toys and little tools.

You can get going quickly without knowing the subjects below but next steps and customization will require some learning.

- TypeScript
- SvelteKit (and the limitations & tricks of developing with wrangler & pages)
- Cloudflare Pages & Wrangler
- AuthJS / NextAuth, which is fairly full featured but is in a transition from a docs perspective.

## 3 Things you will need to set up and consider before you get started.

1. A free (for now) Cloudflare account. D1 databases are [free](https://developers.cloudflare.com/d1/platform/pricing/) while it's in open alpha. I bet they charge for it like [Durable Objects](https://developers.cloudflare.com/workers/platform/pricing/#durable-objects) when it goes v1. But, I'm not a Clouflare employee or insider, I'm barely an outsider. They make you have a [minimum](https://www.cloudflare.com/plans/developer-platform/) $5 monthly base non free plan for some features like Durable objects, I suppose to limit abuse. However, it covers as many projects as you would like.
2. A free GitHub account so you can create an OAuth App that provides the github authentication for this app.

## Configuration Steps for Local Development

- Clone or Fork and Clone this project to your local machine.
- Create a GitHub OAuth App for local development
  - [instructions](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
  - Use whatever name you like
  - Homepage Url `http://127.0.0.1:8788`
  - Authorization Callback URL: `http://127.0.0.1:8788/auth/callback/github`
  - Click Register
  - Generate a secret and keep it and the client id somewhere temporarily, you will need it in next steps
  - Click Update Application (just in case)
- .dev.vars.example -> .dev.vars
  - `cp .dev.vars.example .dev.vars`
  - fill in the id and secret from the last step in your .dev.vars file. This file is in .gitignore
  - Follow the instructions in the file to generate an AUTH_SECRET
- Test locally
  - `npm install`
  - `npm run build`
  - `npm run wrangle`
  - In a separate terminal session run `npx vite build -w` to have vite auto build when it sees source changes
  - Open a browser to http://127.0.0.1:8788 or whatever port shows up in the terminal output from `npm run wrangle`

### Local development notes

- Full hot module reloading (HMR) isn't supported with wrangler and SvelteKit/Vite. Unfortunately SvelteKit/Vite and wrangler dont play nice together from an HMR perspective. Wrangler needs bundled code to run and you need wrangler to get access to the D1 database. Vite compiles/bundles that code with the `@sveltejs/adapter-cloudflare` module, which is set up in `svelte.config.js`. It outputs that code into the `.svelte-kit/cloudflare` directory. When you change the app source code you need to rerun the `npm run build` step before seeing your changes. You can try running `npm run dev` which attempts to do both the wrangler and continuous build with file watching steps in a single terminal session, and kills them both with Ctrl-C. It throws an error in the terminal for every change but it seems to work despite that error. It's probably safer to have it in two different terminal sessions though. A clean solution with no errors would be a nice quality of life improvement.
- If you are developing in vscode with linting and everything turned no you will see some 'red files' that look like errors. I havent figured out how to resolve some of those reported type errors yet but the code compiles and runs. Help here would be great too.

## Configuration Steps for Production Deployment

- Create a new Cloudflare Pages project
  - Create a new project in your Cloudflare Pages dashboard, choose direct upload
  - Choose your name wisely, it will be part of the default domain name it creates for you `https://project-name.pages.dev`. You will need the domain name for the next step.
- GitHub OAuth App for prod developement
  - Make another OAuth App like you did for local development but replace `http://127.0.0.1:8788` in the homepage url and callback url with the domain of your project.
- Workers > D1 Database
  - Now go to your Cloudflare D1 dashboard under Workers and create a new D1 database. The name doesn't matter.
- Pages > Settings > Functions > D1 Database Bindings
  - Navigate back to your pages dashboard and you should see your empty app. Navigate to Settings > Functions > Scroll down to D1 Database Bindings. Set up a new binding with the name `DB`. It must be DB, capitalized. Choose the D1 database to map to the name in the database dropdown.
- Pages > Settings > Environment Variables
  - Now navigate to the Settings > Environment Variables and create a variable for each of the environment variables names in your .dev.vars file. `GITHUB_ID`, `GITHUB_SECRET`, `AUTH_SECRET`. Use the values that you saved when you created the new GitHub OAuth App. I created a new AUTH_SECRET instead of reusing the one from local development.
- Manually Deployment
  - `npm run deploy`
  - Wrangler may ask you to log in if this is your first time doing this.
  - If you have multiple pages projects, it may ask you which one you want to use. You can run `npx wrangler pages publish --help` to see which options you can set in the package.json scripts section for the deploy action to smooth things out for your future development.
- Getting access to debugging / logging
  - `npm run tail`
  - It may ask you which project you would like to tail.
  - `npx wrangler pages deployment --help` to see customization options.
- Configuring a GitHub action to deploy when you merge to the main branch (TBD)
