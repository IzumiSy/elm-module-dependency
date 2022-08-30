import yargs from "yargs";
import path from "path";
import { ElmModules } from "./modules";
import { DebugLogger, NullLogger } from "./logger";

(async () => {
  const args = yargs
    .options({
      entrypoint: {
        alias: "e",
        type: "string",
        description: "an entrypoint module",
      },
      target: {
        alias: "t",
        type: "string",
        description: "a target module to list its depending modules",
      },
      debug: {
        type: "boolean",
        description: "debugging option",
      },
    })
    .demandOption(["entrypoint"])
    .parseSync();

  const entrypointModuleFile = (args.entrypoint as string).trim();

  if (path.extname(entrypointModuleFile) != ".elm") {
    console.error("Entrypoint module must be an Elm module file");
    process.exit(1);
  }

  const elmModules = new ElmModules(
    args.debug ? new DebugLogger() : new NullLogger(),
    entrypointModuleFile
  );
  await elmModules.walk();
  await elmModules.parse();

  if (args.target) {
    elmModules.lookupDependencies(args.target.trim());
  }
})();
