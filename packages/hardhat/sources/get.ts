import fs from "fs";
import path from "path";

export default (name: string) => fs.readFileSync(path.resolve(__dirname, name + ".js"), "utf8");
