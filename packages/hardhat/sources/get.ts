import fs from "fs";
import path from "path";

export default (provider: string, version: string) => {
  const name = provider + "@" + version;
  return {
    provider,
    version,
    name,
    code: fs.readFileSync(path.resolve(__dirname, name + ".js"), "utf8"),
  };
};
