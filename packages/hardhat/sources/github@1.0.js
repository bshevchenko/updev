const [id, ipfsHash] = args;
const github = await Functions.makeHttpRequest({
    url: "https://api.github.com/user",
    method: "GET",
    headers: {
        "Authorization": `Bearer ${secrets.token}`
    }
});
if (github.error) {
    throw Error("GitHub");
}
const { data } = github;
const ipfs = await Functions.makeHttpRequest({
    url: "https://gateway.pinata.cloud/ipfs/" + ipfsHash,
    method: "GET"
});
if (ipfs.error) {
    throw Error("IPFS");
}
if (data.id != id || ipfs.data.id != id) {
    throw Error("ID");
}
// TODO verify other data, allow divergence for followers, remove links from IPFS
return Functions.encodeUint256(1);