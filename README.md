> This repository is a demo for building an AuthJS.dev authenticated site with SvelteKit and deployment on Cloudflare Pages using a D1(Alpha) database database adapter for the authjs.dev user and session store. It demonstrates this using a [GitHub OAuth application](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) as the authentication provider.

## Warning

This project depends on alpha database software, an patch to an open source package that has been accepted and merged to main but not yet published to NPM and a database adapter that has yet to be accepted to the next-auth repository. In short, it's a work in progress, but somewhat usable so I can gather feedback.

## Overview

This is adapted from the official SvelteKit Auth example for [Auth.js](https://sveltekit.authjs.dev) for Cloudflare Pages. It uses a D1 sqlite database which is in open alpha. The D1 database API is subject to change,
You probably don't want to build anything mission critical on it today. However, it's plenty stable enough for hobbys and toys and little tools.

You can get going quickly without knowing the subjects below but next steps and customization will require an investment in learning.

- TypeScript
- SvelteKit (and the limitations & tricks of developing with wrangler & pages)
- Cloudflare Pages & Wrangler
- AuthJS / NextAuth, which is fairly full featured but is in a transition from a docs perspective.

## 3 Things you will need to set up and consider before you get started.

1. A free (for now) Cloudflare account. D1 databases are [free](https://developers.cloudflare.com/d1/platform/pricing/) while its in open alpha. I bet they charge for it like [Durable Objects](https://developers.cloudflare.com/workers/platform/pricing/#durable-objects) when it goes v1. But, I'm not a Clouflare employee or insider, I'm barely an outsider. They make you have a [minimum](https://www.cloudflare.com/plans/developer-platform/) $5 monthly base non free plan for some features like Durable objects, I suppose to limit abuse. However, it covers as many projects as you would like.
2. A free GitHub account so you can create an OAuth App that provides the github authentication for this app.
3. Cloudflare Wrangler installed on your local machine.

## Configuration Steps for Local Development

- GitHub OAuth App for local development [instructions](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
  - Use whatever name you like
  - Homepage Url `http://127.0.0.1:8788`
  - Authorization Callback URL: `http://127.0.0.1:8788/auth/callback/gihub`
  - Click Register
  - Generate a secret and keep it and the client id somewhere temporarily, you will need it in next steps
  - Click Update Application (just in case)
- .dev.vars.example -> .dev.vars

  - `cp .dev.vars.example .dev.vars`
  - fill in the id and secret from the last step in your .dev.vars file. This file is in .gitignore
  - Follow the instructions in the file to generate an AUTH_SECRET

- Test locally
  - `npm install`
  - `npm build`
  - `npm wrangle`
  - Open a browser to http://127.0.0.1:8788 or whatever port shows up in the terminal output from `npm wrangle`

### Local development notes

- Hot reloading isn't supported yet. Unfortunately sveltekit and wrangler dont play nice together from an HMR perspective. Wrangler needs bundled code to run and you need wrangler to get access to the D1 database. When you change the app source code you need to rerun the `npm build` step before running. Vite is doing the building and it has a 'watch' mode for auto rebuilding but I havent had luck with both wrangler running and vite build in watch mode in two different processes. You can just keep wrangler running in one process and rerun build and that seems to work fine. It would be great if someone could figure out how to have both running at the same time.
- If you are developing in vscode with linting and everything turned no you will see some 'red files' that look like errors. I havent figured out how to resolve some of those reported type errors yet but the code compiles and runs. Help here would be great.

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
