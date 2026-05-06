export { loadConfig, saveConfig, addServer } from "./config.js";
export { doctorConfig } from "./doctor.js";
export { exportForTarget } from "./export.js";
export { buildServerFromTemplate } from "./factory.js";
export { importClientConfig, importFromClient, discoverClientConfig } from "./import.js";
export { getTemplate, getTemplates } from "./templates.js";
export type { ClientConfigDiscovery, ClientId, DockConfig, DockServer, DoctorEntry, ServerTemplate } from "./types.js";
