# Obsidian.md DIY Sync Server+Plugin

## Prerequisites/technologies used

This is a monorepo made with pnpm workspaces. Currently not many of the nice monorepo features are being used, but if I ever go to publish this I will fix that.

- pnpm
- nodejs
- express
- obsidian-sample-plugin (used for the plugin template)

## To get started for local development:

1. Clone or fork this repo
1. run `pnpm install` in your terminal where the repo is cloned
1. To install the plugin into obsidian, I recommend using a symlink
1. Symlink the monorepo's `plugin` folder to `/path/to/your/vault/.obsidian/plugins/obsidian-nodejs-sync-plugin
    on macos at the root of this monorepo: `ln -s ./plugin /path/to/your/vault/.obsidian/plugins/obsidian-nodejs-sync-plugin`

    or in my case, 
    `ln -s ~/projects/obsidian-diy-sync/plugin ~/Documents/TestingVault/.obsidian/plugins/obsidian-nodejs-sync-plugin`
1. Now in the monorepo, you can start the plugin in watch mode with `pnpm dev:plugin`
1. Start the server in dev mode `pnpm dev:server`

You will need to reload the plugin in Obsidian to see the changes, but the code should be watching for changes in both the server and plugin.
Now you can develop in both apps at once!


## Plugin

The plugin gives Obsidian a palette command that will sync your vault to the supplied endpoint. You will need to deploy the server somewhere, or you can run it locally.

The plugin sends a POST request to the supplied apiHost+apiEndpoint containing your whole vault. // TODO: only send files that changed since last sync
The plugin also has can GET a vault, so you can sync to another vault.

## Server

The server is needed to talk to the database (in this case, sqlite). The server receives a POST or GET request from the plugin and stores or retrieves the appropriate data.

## Future Development

- Sync on save
- Add routes to the server to be able to grab single nodes, or nodes by tag
