if (secrets.up.toLowerCase() != args[2].toLowerCase()) {
    throw Error("UP " + secrets.up.toLowerCase() + " " + args[2].toLowerCase());
}
const api = await Functions.makeHttpRequest({
    url: "https://api.github.com/user",
    method: "GET",
    headers: {
        "Authorization": `Bearer ${secrets.token}`
    }
});
if (api.error) {
    throw Error("API");
}
const ipfs = await Functions.makeHttpRequest({
    url: "https://gateway.pinata.cloud/ipfs/" + args[1],
    method: "GET"
});
if (ipfs.error) {
    throw Error("IPFS");
}
if (api.data.id != args[0] || ipfs.data.id != args[0]) {
    throw Error("ID");
}
// TODO verify other data, allow divergence for followers, remove links from IPFS
return Functions.encodeUint256(1)