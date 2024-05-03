const fs = require("fs");

function latestVersions() {
    return new Promise((resolve, reject) => {
        fs.readdir(__dirname, (err, files) => {
            if (err) {
                reject("Unable to scan directory: " + err);
                return;
            }
            const providers = {};
            files.forEach(file => {
                const match = file.match(/^(.+?)@([\d\.]+)\.js$/);
                if (match) {
                    const provider = match[1];
                    const version = match[2];

                    // Check and update the latest version
                    if (!providers[provider] || parseFloat(providers[provider]) < parseFloat(version)) {
                        providers[provider] = version;
                    }
                }
            });
            fs.writeFile(__dirname + "/latest.json", JSON.stringify(providers, null, 4), (err) => {
                if (err) {
                    console.error("An error occurred:", err);
                }
            });
            resolve(providers);
        });
    });
}

module.exports = latestVersions;
