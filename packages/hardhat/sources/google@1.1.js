if (secrets.up != args[2]) {
    throw Error("UP")
}
const api = await Functions.makeHttpRequest({
    url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
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
if (api.data.id != args[0] || ipfs.data.id != args[0]) {
    throw Error("ID")
}
["email", "verified_email"].forEach(field => {
    if (api.data[field] !== ipfs.data[field]) {
        throw Error(field)
    }
})
return Functions.encodeUint256(1)