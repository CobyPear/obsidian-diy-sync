# Getting Started

There are two parts to the plugin:

1. An Obsidian Plugin that you install into Obsidian itself
2. An Express.js server + SQLite (default) database that you host somewhere

For local development, see the README.md at the root of the GitHub repo.

## Installing The Plugin

The plugin can be installed through the Community Plugins tab through the
Obsidian Settings.

## Hosting The Server

The server is a node.js application which can be hosted anywhere node can run.

Included in this monorepo is a render.yaml file which should allow you to
easily host the server on [render.com](https://render.com).

You may run the server locally until you feel comfortable hosting.

### Server Technologies

- TypeScript
- Express.js
- Prisma ORM
- SQLite (default)

In order to use a different database, you will need to edit the schemas in the
`server/db` directory. You will also need to configure hosting for the database
or containerize the application.

See [Prisma's documentation](https://prisma.io/docs) for more information on Database Connectors.

## Using The Plugin

All actions in the plugin are done through the command pallete (ctrl + P or cmd + P by default). 

Before using any commands, navigate to **Settings** > **Nodejs Sync Plugin** and configure the hostname and endpoint (use the default endpoint unless it has been changed  in the server).

The `Vault to Fetch` is the name of a vault that has previously been sync'd. This will usually be the name of the vault you are working in, but if you are signing in from a new machine you may want to use this to grab notes from a previous sync.

After configuring the server hostname, create a new user:

1. In the command pallete search for the **Nodejs Sync Plugin: Create New User** command
2. Fill out the form with a secure username and password. The password is
encrypted in the database. There is currently no password recovery or way to
change it. Please use a password manager :smile:

Now you will should able to use the rest of the commands from the command
palette.

### Sync a Vault
To sync your vault with the server, make sure you are logged in as the correct user and use the **Sync Vault** command. If the vault doesn't exist yet it will be created. If it does exist it will be updated with the latest changes. There is no smart diffing at the moment.

### Get a Vault
The vault that will be fetched needs to be set in the plugin's settings. If this is not set, the server will not know which vault to send back. This is because you can **Get** a vault on an empty vault in order to sync a new machine with the server. The vault name is the same as the name of the vault when you first Sync it.

Currently, if you delete a file and Get the vault, the file will be restored. Getting a vault should not override your current changes if they are different from your sync'd version. I am open to developing some logic around this.

### Delete a User
Only the currently logged in user can be deleted. **BE CAREFUL!!** If you delete the current user, all data in the server belonging to that user (vaualts, nodes) will be deleted as well.
Make sure you have a copy of your vault backed up somewhere before deleting a user!