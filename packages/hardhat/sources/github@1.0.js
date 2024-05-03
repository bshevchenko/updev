const [id, ipfsHash] = args;
const github = await Functions.makeHttpRequest({
    url: "https://api.github.com/user",
    method: "GET",
    headers: {
        "Authorization": `Bearer ${secrets.token}`
    }
});
if (github.error) {
    throw Error("GitHub fail");
}
const { data } = github.data;
const ipfs = await Functions.makeHttpRequest({
    url: "https://gateway.pinata.cloud/ipfs/" + ipfsHash,
    method: "GET"
});
if (ipfs.error) {
    throw Error("IPFS fail");
}
if (data.id != id || ipfs.data.id != id) {
    throw Error("ID fail");
}

const followers = data.followers;
const ipfs_followers = ipfs.data.followers;
delete data.followers;
delete ipfs.data.followers;

if (JSON.stringify(data) != JSON.stringify(ipfs.data)) {
    throw Error("Data fail");
}
if (followers != ipfs_followers) {
    if (Math.abs(followers - ipfs_followers) / followers * 100 <= 5) {
        throw Error("Followers fail");
    }
    return Functions.encodeUint256(2);
}
return Functions.encodeUint256(1);