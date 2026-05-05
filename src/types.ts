export interface ServerTemplate {
  key: string;
  title: string;
  command: string;
  args: string[];
  env: string[];
}

export interface DockServer {
  name: string;
  template: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}

export interface DockConfig {
  servers: DockServer[];
}

export interface DoctorEntry {
  name: string;
  command: string;
  commandStatus: "present" | "missing";
  envStatus: "ok" | "missing";
  missingEnv: string[];
}
