if (secrets.up.toLowerCase() != args[2].toLowerCase()) {
    throw Error("UP");
}
const api = await Functions.makeHttpRequest({
    url: "https://discord.com/api/v10/users/@me",
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
["id", "username", "discriminator", "public_flags", "flags", "mfa_enabled", "clan", "premium_type", "email", "verified"].forEach(field => {
    if (api.data[field] !== ipfs.data[field]) {
        throw Error(field)
    }
})
return Functions.encodeUint256(1)