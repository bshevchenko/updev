import fs from "fs";
import path from "path";

const fileContents = (name: string) => fs.readFileSync(path.resolve(__dirname, name + ".js"), "utf8");

export default (provider: string, version: string) => {
  const name = provider + "@" + version;
  let code = fileContents(name).replace(
    new RegExp("{snippets/([^}]+)}", "g"),
    (match, snippetName) => fileContents(`snippets/${snippetName}`)
  );
  return {
    provider,
    version,
    name,
    code,
  };
};
