const t = await Functions.makeHttpRequest({
    url: "https://api.twitter.com/2/users/me?user.fields=id,created_at,username,verified,verified_type,public_metrics",
    method: "GET",
    headers: {
        "Authorization": `Bearer ${secrets.token}`
    }
})
if (t.error) {
    throw Error("Twitter")
}
const i = await Functions.makeHttpRequest({
    url: "https://gateway.pinata.cloud/ipfs/" + args[1],
    method: "GET"
})
if (i.error) {
    throw Error("IPFS")
}
if (t.data.data.id != args[0] || i.data.id != args[0] || t.data.data.created_at != i.data.created_at ||
    t.data.data.username != i.data.username || t.data.data.verified != i.data.verified ||
    t.data.data.verified_type != i.data.verified_type) {
    throw Error("Data");
}
for (const k of Object.keys(t.data.data.public_metrics)) {
    if (Math.abs(t.data.data.public_metrics[k] - i.data.public_metrics[k]) > t.data.data.public_metrics[k] * 0.05) {
        throw Error("Public metrics");
    }
}
return Functions.encodeUint256(1)