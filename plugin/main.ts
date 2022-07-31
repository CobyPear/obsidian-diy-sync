import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { extractContent } from "./utils/extractContent";
import { getVaultStructure } from "./utils/getVaultStructure";
// Remember to rename these classes and interfaces!

interface NodeSyncPluginSettings {
  apiHost: string;
  endpoint: string;
  authToken?: string;
}

const DEFAULT_SETTINGS: NodeSyncPluginSettings = {
  apiHost: "http://localhost:3001",
  endpoint: "/api/vault",
};

interface Fetch {
  [key: string]: {
    [key: string]: string;
  };
}

export default class NodeSyncPlugin extends Plugin {
  settings: NodeSyncPluginSettings;

  async onload() {
    await this.loadSettings();

    // add command that syncs the vault to the api host in settings
    this.addCommand({
      id: "sync-vault-to-server",
      name: "Sync Vault",
      callback: async () => {
        const files = this.app.vault.getMarkdownFiles();
        const url = `${this.settings.apiHost}${this.settings.endpoint}`;
        // extracts all content from the list of files
        // need to make a nice object to send to the BE
        // it should have the file metadata so that a vault that is fetched can be rebuilt

        console.log("files", files);
        const obj: Fetch = {};

        for (const file of files) {
          try {
            const content = await extractContent(file);
            if (!content) {
              throw new Error(`Could not extract content from ${file.name}`);
            }
            obj[file.name] = {
              content: content as string,
              name: file.name,
              extension: file.extension,
              path: file.path,
            };
          } catch (error) {
            console.error(error);
          }
        }

        console.log("putData", obj);

        // const flatFiles = files.map(async (file) => {
        //   const data = await extractContent(file);
        //   return {
        //     data,
        //     name: file.name,
        //     extension: file.extension,
        //     path: file.path,
        //   };
        // });

        const dataToPut = {
          vaultMap: await getVaultStructure(this.app.vault),
          files: obj,
        };

        // console.log("dataToPut", dataToPut);

        fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify(dataToPut),
        })
          .then((data) => data.json())
          .then(console.log)
          .catch((err) => console.error(err));

        // Promise.all(files.map(async (file) => await extractContent(file))).then(
        //   (data) => {
        //     fetch(url, {
        //       method: "PUT",
        //       headers: {
        //         "Content-Type": "application/json",
        //         // 'Content-Type': 'application/x-www-form-urlencoded',
        //       },
        //       body: data.toString(),
        //     })
        //       .then((data) => console.log(data))
        //       .catch((err) => console.error(err));
        //   }
        // );
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

    containerEl.createEl("h2", { text: "Settings for my Nodejs Sync plugin." });

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
  }
}
