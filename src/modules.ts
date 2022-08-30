import fs from "fs";
import readline from "readline";
import path from "path";
import { Logger } from "./logger";
import { Module } from "./module";

export class ElmModules {
  private moduleFiles: string[];
  private modules: Module[];

  constructor(
    private readonly logger: Logger,
    private readonly entryModuleFile: string
  ) {
    this.entryModuleFile = entryModuleFile;
    this.moduleFiles = [];
    this.modules = [];
  }

  async walk() {
    for await (const p of walk(this.entrypointDirectory())) {
      this.moduleFiles.push(p);
    }
  }

  async parse() {
    await Promise.all(
      this.moduleFiles.map((moduleFile) => {
        return this.parseElmModule(moduleFile).then((result) => {
          this.logger.log(`Parsing... ${result.getName()} (${moduleFile})`);
        });
      })
    );

    this.logger.log(`${this.modules.length} modules parsed`);
  }

  lookupDependencies(moduleName: string) {
    const a = this.modules.filter((module) => module.isDepending(moduleName));
    a.forEach((a0) => {
      console.log(a0.getName());
    });
  }

  private async parseElmModule(moduleFile: string): Promise<Module> {
    return new Promise((resolve) => {
      const fileReader = readline.createInterface({
        input: fs.createReadStream(moduleFile),
      });

      const module = new Module(this.entrypointDirectory());
      fileReader.on("line", (line) => {
        if (line.startsWith("port module") || line.startsWith("module")) {
          let moduleName = line.startsWith("port module")
            ? line.substring(12)
            : line.substring(7);
          const [a0, _] = moduleName.split(" exposing");
          module.setName(a0);
        } else if (line.startsWith("import")) {
          module.addImportDependency(line.substring(7));
        }
      });

      fileReader.on("close", () => {
        this.modules.push(module);
        resolve(module);
      });
    });
  }

  private entrypointDirectory(): string {
    return path.dirname(this.entryModuleFile);
  }
}

async function* walk(dir: string): any {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* await walk(entry);
    else if (d.isFile()) yield entry;
  }
}
