export interface NodeSyncPluginSettings {
  apiHost: string;
  endpoint: string;
  clientSecret: string;
  vaultToFetch?: string;
}

export interface Node {
  content: string;
  name: string;
  extension: string;
  path: string;
  ctime: string;
  mtime: string;
}

export interface VaultToSync {
  vault: string;
  nodes: Node[];
}
