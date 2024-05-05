const api = await Functions.makeHttpRequest({
    url: "https://buidlguidl-v3.appspot.com/builders/" + args[0],
})
if (api.error) {
    throw Error("API")
}
if (!api.data.status.text.toLowerCase().includes(args[2].toLowerCase())) {
    throw Error("UP");
}
const ipfs = await Functions.makeHttpRequest({
    url: "https://gateway.pinata.cloud/ipfs/" + args[1],
    method: "GET"
})
if (ipfs.error) {
    throw Error("IPFS")
}
["id", "role", "function", "scholarship", "ens", "creationTimestamp"].forEach(field => {
    if (api.data[field] !== ipfs.data[field]) {
        throw Error(field)
    }
})
return Functions.encodeUint256(1)