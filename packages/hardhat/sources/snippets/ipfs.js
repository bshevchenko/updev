if (id != args[0]) {
    throw Error("ID")
}
const ipfs = await Functions.makeHttpRequest({
    url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    method: "POST",
    headers: {
        "Authorization": `Bearer ${secrets.pinata}`,
        "Content-Type": "application/json"
    },
    data: {
        pinataContent,
    }
})
if (ipfs.error) {
    throw Error("IPFS")
}
return Functions.encodeString(ipfs.data.IpfsHash)