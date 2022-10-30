# Obsidian.md DIY Sync Server+Plugin

## Prerequisites

This is a monorepo made with pnpm workspaces.

- pnpm
- node
- npm

### Technologies Used

- TypeScript
- Express
- Prisma
- sqlite - this is the default. You may use any DB supported by Prisma
- obsidian-sample-plugin (used for the plugin template)

## To get started for local development:

1. Clone or fork this repo
1. run `pnpm install` in your terminal where the repo is cloned
1. To install the plugin into obsidian, I recommend using a symlink
1. Symlink the monorepo's `plugin` folder to `/path/to/your/vault/.obsidian/plugins/obsidian-nodejs-sync-plugin on macos at the root of this monorepo: `ln -s ./plugin /path/to/your/vault/.obsidian/plugins/obsidian-nodejs-sync-plugin`

   or in my case,
   `ln -s ~/projects/obsidian-diy-sync/plugin ~/Documents/TestingVault/.obsidian/plugins/obsidian-nodejs-sync-plugin`

1. add a .env file with the following variables

   ```
   JWT_REFRESH_SECRET=some secret here!
   JWT_ACCESS_SECRET=some different secret here!
   ```

1. Now in the monorepo, you can start the plugin in watch mode with `pnpm dev:plugin`
1. Start the server in dev mode `pnpm dev:server`

You will need to reload the plugin in Obsidian to see the changes, but the code should be watching for changes in both the server and plugin.
Now you can develop in both apps at once!

## Plugin

The plugin gives Obsidian a palette command that will sync your vault to the supplied endpoint. You will need to deploy the server somewhere (see the Deploy to Render button), or you can run it locally.

The plugin sends a POST request to the supplied apiHost+apiEndpoint containing your whole vault.
The plugin also has can GET a vault, so you can sync to another vault.

## Server

The server is needed to talk to the database (in this case, sqlite). The server receives a PUT or GET request from the plugin and stores or retrieves the appropriate data.

I have made the server to be deployable to [render.com](https://render.com) which is able to mount a file for use as the sqlite database.

Click the button below to get started!

![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## Auth

Auth is achieved through username and password (NOTE: there is no validation on either right now, password can by anything) exchanged for a refresh token and access token. Both tokens are set to httpOnly cookies for 7 days and 15 minutes respectively. Once the access token expires, if the refresh token has not expired and it matches the refresh token in the DB, it will be exchanged for a new refresh and access token.

Currently on the plugin side, the username is being stored in localstorage which is sent with the POST request on the refresh_token route. I'm not sure if this is the best approach and I'm open to suggestions for auth in general. Is this the best approach?

I would like to implement a OTP feature which takes in an email or phone number and sends a password. This password would be exchanged for the refresh and access tokens. I think this would be nice because the DB wouldn't have to hold a username and password necessarily


## Future Development

- Sync on save
- Add routes to the server to be able to grab single nodes, or nodes by tag
- Add `/blogs` route to the server that serves nodes with a #published tag and/or `published: true` fontmattter.
- Sync on save option
