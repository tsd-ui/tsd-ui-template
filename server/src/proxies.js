import { CONSOLE_ENV } from "@tsd-ui/common";

/** @type Logger */
const logger =
  process.env.DEBUG === "1"
    ? console
    : {
        info() {},
        warn: console.warn,
        error: console.error,
      };

export default {
  api: {
    pathFilter: "/api",
    target: CONSOLE_ENV.CONSOLE_API_URL ?? "http://localhost:8080",
    logger,
    changeOrigin: true,
  },
};
