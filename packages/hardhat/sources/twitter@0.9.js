const [id, ipfsHash] = args
const fields = ['id', 'created_at', 'username', 'verified', 'verified_type']
const twitter = await Functions.makeHttpRequest({
    url: "https://api.twitter.com/2/users/me?user.fields=" + fields.join(",") + ",public_metrics",
    method: "GET",
    headers: {
        "Authorization": `Bearer ${secrets.token}`
    }
})
if (twitter.error) {
    throw Error("Twitter")
}
const { data } = twitter.data
const ipfs = await Functions.makeHttpRequest({
    url: "https://gateway.pinata.cloud/ipfs/" + ipfsHash,
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
for (const key in data.public_metrics) {
    const diff = Math.abs(data.public_metrics[key] - ipfs.data.public_metrics[key]);
    if (diff > data.public_metrics[key] * 0.05) {
        throw Error("public metrics");
    }
}
return Functions.encodeUint256(1)