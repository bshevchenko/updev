const fs = require("fs");

const latestVersions = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(__dirname, (err: any, files: any) => {
      if (err) {
        reject("Unable to scan directory: " + err);
        return;
      }
      const providers: any = {};
      files.forEach((file: any) => {
        const match = file.match(/^(.+?)@([\d\.]+)\.js$/);
        if (match) {
          const provider = match[1];
          const version: any = match[2];

          // Check and update the latest version
          if (
            !providers[provider as keyof typeof providers] ||
            parseFloat(providers[provider as keyof typeof providers]) < parseFloat(version)
          ) {
            providers[provider as keyof typeof providers] = version;
          }
        }
      });
      fs.writeFile(__dirname + "/../../nextjs/latest.json", JSON.stringify(providers, null, 4), err => {
        if (err) {
          console.error("An error occurred:", err);
        }
      });
      resolve(providers);
    });
  });
};

export default latestVersions;
