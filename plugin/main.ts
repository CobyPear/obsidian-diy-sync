import { App, Plugin, PluginSettingTab, Setting, Modal } from "obsidian";
import { NodeSyncPluginSettings, VaultToSync, Node } from "types";
import { extractContent } from "./utils/extractContent";
import { writeNodeToFile } from "utils/writeNodeToFile";

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
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(filesToPut),
          });
          if (res.ok) {
            const data = await res.json();
            console.log(data);
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
            `${this.url}?vault=${this.settings.vaultToFetch}`
          );
          if (res.ok) {
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

    // LOGIN COMMAND
    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: "open-sample-modal-simple",
      name: "Open sample modal (simple)",
      callback: () => {
        new LoginModal(this.app, this.settings.apiHost).open();
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

class LoginModal extends Modal {
  username: string;
  password: string;
  url: string;
  isWarningShown = false;

  constructor(app: App, url: string) {
    super(app);
    this.url = url;
  }

  onSubmit(username: string, password: string) {
    // POST to /api/login
    // if 200 response, the token should be accessable in a cookie?
    console.log(this.username, this.password);
  }

  onOpen() {
    const { contentEl, containerEl } = this;
    contentEl.addClass('login-modal')
    contentEl.createEl("h1", { text: `Login to ${this.url}` });
    // Username input control
    new Setting(contentEl).setName("Username").addText((text) =>
      text.onChange((value) => {
        this.username = value;
      })
    );

    // Password input control
    new Setting(contentEl).setName("Password").addText((text) => {
      text.inputEl.type = "password";
      return text.onChange((value) => {
        this.password = value;
      });
    });

    // Login button
    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("Login")
        .setCta()
        .onClick(() => {
          console.log(this.isWarningShown);
          // Show an error to the user that credentials are missing
          if (!this.password || !this.username) {
            if (!this.isWarningShown) {
              const warning = contentEl.createEl("span", {
                text: "Missing credentials. Please input username and password.",
                cls: ["warning", "fade-in", "fade-out"]
              });
              this.isWarningShown = true;
          
              setTimeout(() => {
                this.contentEl.removeChild(warning);
                this.isWarningShown = false;
              }, 5000);
            }
          } else {
            this.close();
            this.onSubmit(this.username, this.password);
          }
        })
    );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
