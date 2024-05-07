if (secrets.up != args[2]) {
    throw Error("UP")
}
const api = await Functions.makeHttpRequest({
    url: "https://api.github.com/user",
    method: "GET",
    headers: {
        "Authorization": `Bearer ${secrets.token}`
    }
})
if (api.error) {
    throw Error("API")
}
const ipfs = await Functions.makeHttpRequest({
    url: "https://gateway.pinata.cloud/ipfs/" + args[1],
    method: "GET"
});
if (ipfs.error) {
    throw Error("IPFS")
}
if (api.data.id != args[0] || ipfs.data.id != args[0]) {
    throw Error("ID")
}
["login", "created_at"].forEach(field => {
    if (api.data[field] !== ipfs.data[field]) {
        throw Error(field)
    }
})
if (Math.abs(api.data.followers - ipfs.data.followers) > api.data.folowers * 0.05) {
    throw Error("followers")
}
return Functions.encodeUint256(1)