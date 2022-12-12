## Obsidian DIY Sync Plugin

An Obsidian.md plugin that interacts with a self-hostable nodejs server

## Plugin

The plugin gives Obsidian a palette command that will sync your vault to the supplied endpoint. You will need to deploy the server somewhere or you can run it locally.

The plugin sends a POST request to the supplied apiHost+apiEndpoint containing your whole vault.
The plugin also has can GET a vault, so you can sync to another

### Settings

- `apiHost` - the location of your server. `http://localhost:3001` by default
- `endpoint` - The endpoint to send and get the vault. `/api/vault` by default
- vaultToFetch - The name of the vault to sync and fetch. This is usually the name of your current vault, unless you are fetching one that exists already on the server.

### Commands

#### Create User

Provide a username and password. Multiple users are possible per server. Users can only fetch their own vaults. Users can also sync multiple vaults.

#### Login

Login to the server with a created user and password. You will need to login when the refresh token expires or the cookie in the app is cleared.

#### Logout

Logout the currently logged in user.

#### Sync Vault

Send the contents of the current vault to the server. The name of the vault on the server will be the `vaultToFetch`

#### Get Vault

Get the contents of the current vault

## Server

See [the monorepo](https://github.com/cobypear/obsidian-diy-sync) for more info and docs.

Features:

- Authentication
- Multiple users per server
- Multiple vaults per user
- Vault fetchable only by the user who created it

## Troubleshooting

Open the dev console with `ctrl+shift+i` to see any errors from the plugin or the server
