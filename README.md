# Obsidian.md DIY Sync Server+Plugin

## Prerequisites

This is a monorepo made with pnpm workspaces.

- pnpm
- node
- npm
- podman

### Technologies Used

- TypeScript
- Express
- Prisma
- sqlite - this is the default. You may use any DB supported by Prisma
- obsidian-sample-plugin (used for the plugin template)
- Docker/podman

## To get started for local development:

1. Clone or fork this repo
1. run `pnpm install` in your terminal where the repo is cloned
1. To install the plugin into obsidian, I recommend using a symlink
1. Symlink the monorepo's `plugin` folder to `/path/to/your/vault/.obsidian/plugins/obsidian-nodejs-sync-plugin on macos at the root of this monorepo: `ln -s ./plugin /path/to/your/vault/.obsidian/plugins/obsidian-nodejs-sync-plugin`

   or in my case,

   ```bash
   ln -s ~/projects/obsidian-diy-sync/plugin ~/Documents/TestingVault/.obsidian/plugins/obsidian-nodejs-sync-plugin
   ```

   On linux:

   ```bash
   ln -s ~/projects/obsidian-diy-sync/plugin/* ~/Documents/TestingVault/.obsidian/plugins/obsidian-nodejs-sync-plugin/
   ```

1. add a `.env` file to `./server` with the following variables

   ```
   JWT_REFRESH_SECRET=some secret here!
   JWT_ACCESS_SECRET=some different secret here!
   DATABASE_URL=file:/some/path/to/sqlite.db
   CLIENT_SECRET=yet another secret here
   ```

1. Now in the monorepo, you can start the plugin in watch mode with `pnpm dev:plugin`
1. prepare the database with `pnpm prisma-generate && pnpm prisma-db-push`
1. Start the server in dev mode `pnpm dev:server`

You will need to reload the plugin in Obsidian to see the changes in the plugin, but the code should be watching for changes in both the server and plugin.
Now you can develop in both apps at once!

## Plugin

The plugin gives Obsidian a palette command that will sync your vault to the supplied endpoint. You will need to deploy the server somewhere (see the Deploy to Render button), or you can run it locally.

The plugin sends a POST request to the supplied apiHost+apiEndpoint containing your whole vault.
The plugin also has can GET a vault, so you can sync to another vault.

## Server

The server is needed to talk to the database (in this case, sqlite). The server receives a PUT or GET request from the plugin and stores or retrieves the appropriate data.

Media is not currently supported.

### Dockerfile

To build the server into a Docker image (use docker if you prefer):

```sh
podman build -f Dockerfile -t obsidian-server
```

and to run it, use the `.env` file created earlier. Note: you may want to mount the sqlite db file from a volume

```sh
podman run -p 8000:8000 -d --name obsidian-server --env-file=.env obsidian-server:latest
```

### The Blog Route

There is also a route at `/api/blog` that is not blocked by cors by default. Given a query string parameter of a vault name, you can fetch all nodes that have frontmatter `published: true` or a #published hashtag. (The #published hashtag is removed from the response.)

I have made the server to be deployable to [render.com](https://render.com) which is able to mount a file for use as the sqlite database.

Click the button below to get started!\*

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

\*Currently after the first deploy you will need to SSH into the server either through their GUI or the given command and run the following commands:

```shell
pnpm prisma-generate && pnpm prisma-db-push
```

This will generate the prisma client and create the database.
For some reason this is not possible on the first build. It might be possible to run these before the first start instead of build but I need to experiment more.

## Auth

Auth is achieved through username and password exchanged for tokens. There is no password length or complexity requirement.

A user can only be created from a client if the client secret is present on both client and server. This way, not just anybody who knows your server's endpoint can create a new user.

Please use a secure password. Also do not share your backend URL, unless you want to share a backend; multiple users and vaults are supported, however at this time you cannot share vaults between users (Open to supporting this).

A successful creation of a user or signup will return a refresh token and access token. Both tokens are set to httpOnly cookies for 7 days and 15 minutes respectively. Once the access token expires, if the refresh token has not expired and it matches the refresh token in the DB, it will be exchanged for a new refresh and access token.

Currently on the plugin side, the username is being stored in localstorage which is sent with the POST request on the refresh_token route. I'm not sure if this is the best approach and I'm open to suggestions for auth in general. Is this the best approach?

I would like to implement a OTP feature which takes in an email or phone number and sends a password. This password would be exchanged for the refresh and access tokens. I think this would be nice because the DB wouldn't have to hold a username and password necessarily

## Future Development

- Sync on save
- Add routes to the server to be able to grab single nodes, or nodes by tag
- "magic link" or OTP login
- Media storage
- Add support for other DBs
