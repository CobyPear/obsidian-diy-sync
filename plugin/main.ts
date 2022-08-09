import { App, Modal, Plugin, PluginSettingTab, Setting } from "obsidian";
import { NodeSyncPluginSettings, VaultToSync, Node } from "types";
import { extractContent } from "./utils/extractContent";
import { writeNodeToFile } from "utils/writeNodeToFile";
import { LoginModal, MessageModal } from "components/modals";
import { refreshToken } from "utils/refreshToken";

const DEFAULT_SETTINGS: NodeSyncPluginSettings = {
  apiHost: "http://localhost:3001",
  endpoint: "/api/vault",
  vaultToFetch: "default",
};

export default class NodeSyncPlugin extends Plugin {
  settings: NodeSyncPluginSettings;
  url: string;

  async onload() {
    await this.loadSettings();
    this.url = `${this.settings.apiHost}${this.settings.endpoint}`;

    // add command that syncs the vault to the api host in settings
    this.addCommand({
      id: "sync-vault-to-server",
      name: "Sync Vault",
      callback: async () => {
        const files = this.app.vault.getMarkdownFiles();

        // extracts all content from the list of files
        // need to make a nice object to send to the BE
        // it should have the file metadata so that a vault that is fetched can be rebuilt

        const filesToPut: VaultToSync = {
          vault: "",
          nodes: [],
        };
        for (const file of files) {
          try {
            const content = await extractContent(file);
            if (!content) {
              throw new Error(`Could not extract content from ${file.name}`);
            }
            const node = {
              content: content as string,
              name: file.name,
              extension: file.extension,
              path: file.path,
              ctime: file.stat.ctime.toString(),
              mtime: file.stat.mtime.toString(),
            };
            filesToPut.nodes.push(node);
          } catch (error) {
            console.error(error);
          }
        }
        // add the name so we know which vault to update on the server
        filesToPut.vault = this.app.vault.getName();

        console.log("filesToPut", filesToPut);
        try {
          const res = await fetch(this.url, {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(filesToPut),
          });
          const user = window.localStorage.getItem("user");
          if (!res.ok && user) {
            refreshToken(this.settings.apiHost, user);
          } else if (res.ok) {
            const data = await res.json();
            console.log("data from fetch: ", data);
          }
        } catch (error) {
          console.error(error);
        }
      },
    });

    // get a remote vault
    this.addCommand({
      id: "get-vault-from-server",
      name: "Get Vault",
      callback: async () => {
        if (!this.url || !this.settings.vaultToFetch) {
          throw new Error(
            "URL and vaultToFetch required. See settings for more details."
          );
        }
        try {
          console.log(`Fetching ${this.settings.vaultToFetch}...`);
          const res = await fetch(
            `${this.url}?vault=${this.settings.vaultToFetch}`,
            {
              credentials: "include",
            }
          );
          const user = window.localStorage.getItem("user");
          if (!res.ok && user) {
            refreshToken(this.settings.apiHost, user);
          } else if (res.ok) {
            const { name: vaultName, nodes } = await res.json();
            Promise.all(
              nodes.map(async (node: Node) => {
                // write the node back into the file
                await writeNodeToFile(node, vaultName, this.app.vault);
              })
            ).catch(console.error);
          }
        } catch (error) {
          console.error(error);
        }
      },
    });

    // LOGIN USER COMMAND
    this.addCommand({
      id: "open-login-modal",
      name: "Login to Server",
      callback: async () => {
        const loginModal = new LoginModal(
          this.app,
          this,
          this.settings.apiHost,
          "login"
        );
        loginModal.open();
      },
    });

    // CREATE USER COMMAND
    this.addCommand({
      id: "open-create-user-modal",
      name: "Create New User",
      callback: async () => {
        const loginModal = new LoginModal(
          this.app,
          this,
          this.settings.apiHost,
          "user"
        );
        loginModal.open();
      },
    });

    // LOGOUT USER DOMMAND
    this.addCommand({
      id: "logout-user",
      name: "Logout User",
      callback: async () => {
        const username = window.localStorage.getItem("user");
        if (username) {
          const res = await fetch(`${this.settings.apiHost}/api/logout`, {
            method: "POST",
            body: JSON.stringify({ username }),
          });
          if (res.ok) {
            const data = await res.json();
            console.log(data);
            // TODO: delete cookie from the client side
            new MessageModal(this.app, data.message).open();
          }
        }
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: NodeSyncPlugin;

  constructor(app: App, plugin: NodeSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", {
      text: "Settings for my Nodejs Sync plugin.",
    });

    // API Host setting
    new Setting(containerEl)
      .setName("API Host")
      .setDesc("The location of your server")
      .addText((text) =>
        text
          .setPlaceholder(
            "Enter your api host. For example https://my.hostingprovider.myapp.com"
          )
          .setValue(this.plugin.settings.apiHost)
          .onChange(async (value) => {
            this.plugin.settings.apiHost = value;
            await this.plugin.saveSettings();
          })
      );
    // API Endpoint setting
    new Setting(containerEl)
      .setName("API Endpoint")
      .setDesc("The location to send your vault")
      .addText((text) =>
        text
          .setPlaceholder("Enter your api endpoint. For example /api/vault")
          .setValue(this.plugin.settings.endpoint)
          .onChange(async (value) => {
            this.plugin.settings.endpoint = value;
            await this.plugin.saveSettings();
          })
      );
    // Vault to Fetch setting
    new Setting(containerEl)
      .setName("Vault to fetch")
      .setDesc(
        "The name of the vault to fetch when using the Get Vault command"
      )
      .addText((text) =>
        text
          .setPlaceholder("Enter the name of your remote vault")
          .setValue(this.plugin.settings.vaultToFetch as string)
          .onChange(async (value) => {
            this.plugin.settings.vaultToFetch = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
