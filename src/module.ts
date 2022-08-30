import fs from "fs";

export class Module {
  private name?: string;
  private dependingModules: string[];

  constructor(private readonly basePath: string) {
    this.dependingModules = [];
  }

  setName(value: string) {
    this.name = value;
  }

  addImportDependency(value: string) {
    const [b0, _] = value.split(" exposing ");
    const maybeModuleName = b0.split(".");

    if (maybeModuleName.length > 0) {
      const rootNamespace = maybeModuleName[0];
      try {
        fs.accessSync(`${this.basePath}/${rootNamespace}`, fs.constants.F_OK);
      } catch (e) {
        return;
      }
    }

    let moduleNames: string[] = [];
    maybeModuleName.forEach((mm) => {
      const [bb0_] = mm.split(" as ");
      moduleNames.push(bb0_);
    });

    this.dependingModules.push(moduleNames.join("."));
  }

  getName(): string {
    return this.name || "<unknown>";
  }

  isDepending(moduleName: string): boolean {
    return this.dependingModules.includes(moduleName);
  }
}
