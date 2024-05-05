if (secrets.up.toLowerCase() != args[2].toLowerCase()) {
    throw Error("UP")
}
const fields = ["id", "created_at", "username", "verified", "verified_type"]
const api = await Functions.makeHttpRequest({
    url: "https://api.twitter.com/2/users/me?user.fields=" + fields.join(",") + ",public_metrics",
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
})
if (ipfs.error) {
    throw Error("IPFS")
}
fields.forEach(field => {
    if (data[field] !== ipfs.data[field]) {
        throw Error(field)
    }
})
for (const k of Object.keys(api.data.public_metrics)) {
    if (Math.abs(api.data.public_metrics[k] - ipfs.data.public_metrics[k]) > api.data.public_metrics[k] * 0.05) {
        throw Error("Public metrics")
    }
}
return Functions.encodeUint256(1)