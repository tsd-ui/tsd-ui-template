/** Define process.env to contain `ConsoleEnvType` */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends Partial<Readonly<ConsoleEnvType>> {}
  }
}

/**
 * The set of environment variables used by `@tsd-ui` packages.
 */
export interface ConsoleEnvType {
  NODE_ENV: "development" | "production" | "test";
  VERSION: string;

  /** The listen port for the UI's server */
  PORT?: string;

  /** Target URL for the UI server's `/api` proxy */
  CONSOLE_API_URL?: string;

  /** Location of branding files (relative paths computed from the project source root) */
  BRANDING?: string;
}

/**
 * Keys in `ConsoleEnv` that are only used on the server and therefore do not
 * need to be sent to the client.
 */
export const SERVER_ENV_KEYS = ["PORT", "CONSOLE_API_URL", "BRANDING"];

/**
 * Create a `ConsoleEnv` from a partial `ConsoleEnv` with a set of default values.
 */
export const buildConsoleEnv = ({
  NODE_ENV = "production",
  PORT,
  VERSION = "99.0.0",
  CONSOLE_API_URL,
  BRANDING,
}: Partial<ConsoleEnvType> = {}): ConsoleEnvType => ({
  NODE_ENV,
  PORT,
  VERSION,
  CONSOLE_API_URL,
  BRANDING,
});

/**
 * Default values for `ConsoleEnvType`.
 */
export const CONSOLE_ENV_DEFAULTS = buildConsoleEnv();

/**
 * Current `@tsd-ui` environment configurations from `process.env`.
 */
export const CONSOLE_ENV = buildConsoleEnv(process.env);
