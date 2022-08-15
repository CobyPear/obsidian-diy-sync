import NodeSyncPlugin from "main";
import { Modal, App, Setting } from "obsidian";

type modalType = "user" | "login";

export class LoginModal extends Modal {
  username: string;
  password: string;
  confirmPass: string;
  url: string;
  plugin: NodeSyncPlugin;
  // is this a login modal
  // or a create user modal?
  modalType: modalType;
  isWarningShown = false;

  constructor(
    app: App,
    plugin: NodeSyncPlugin,
    url: string,
    modalType: modalType
  ) {
    super(app);
    this.plugin = plugin;
    this.url = url;
    this.modalType = modalType;
  }

  onSubmit(username: string, password: string) {
    // POST to /api/login
    // if 200 response, the token should be accessable in a cookie?
    // otherwise, open a new modal with the error
    fetch(`${this.url}/api/${this.modalType}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.username) {
          return new MessageModal(this.app, data.message).open();
        } else {
          this.setCurrentUser(data.username);
        }
      })
      .catch(console.error);
  }

  setCurrentUser(username: string) {
    localStorage.setItem("user", username);
  }

  onOpen() {
    const title =
      this.modalType === "user" ? "Create a User" : `Login to ${this.url}`;
    const { contentEl, containerEl } = this;
    contentEl.addClass("login-modal");
    contentEl.createEl("h1", { text: title });
    // Username input control
    new Setting(contentEl).setName("Username").addText((text) =>
      text.onChange((value) => {
        this.username = value;
      })
    );

    // Password input control
    new Setting(contentEl).setName("Password").addText((text) => {
      text.inputEl.type = this.modalType === "login" ? "password" : "text";
      return text.onChange((value) => {
        this.password = value;
      });
    });

    this.modalType === "user" &&
      new Setting(contentEl).setName("Confirm Password").addText((text) => {
        return text.onChange((value) => {
          this.confirmPass = value;
        });
      });

    // Create user button
    this.modalType === "user" &&
      new Setting(contentEl).addButton((btn) =>
        btn
          .setButtonText("Create User")
          .setCta()
          .onClick(() => {
            // Show an error to the user that credentials are missing
            if (this.password !== this.confirmPass) {
              if (!this.isWarningShown) {
                const warning = contentEl.createEl("span", {
                  text: "Passwords do not match. Please confirm passwords match and try again.",
                  cls: ["warning", "fade-out"],
                });
                this.isWarningShown = true;

                setTimeout(() => {
                  this.contentEl.removeChild(warning);
                  this.isWarningShown = false;
                }, 5000);
              }
            } else {
              this.onSubmit(this.username, this.password);
              this.close();
            }
          })
      );

    // Login button
    this.modalType === "login" &&
      new Setting(contentEl).addButton((btn) =>
        btn
          .setButtonText("Login")
          .setCta()
          .onClick(() => {
            // Show an error to the user that credentials are missing
            if (!this.password || !this.username) {
              if (!this.isWarningShown) {
                const warning = contentEl.createEl("span", {
                  text: "Missing credentials. Please input username and password.",
                  cls: ["warning", "fade-in", "fade-out"],
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

export class MessageModal extends Modal {
  message: string;
  constructor(app: App, message: string) {
    super(app);
    this.message = message;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.setText(this.message);
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
