if (secrets.up != args[1]) {
    throw Error("UP")
}
const api = await Functions.makeHttpRequest({
    url,
    method: "GET",
    headers: {
        "Authorization": `Bearer ${secrets.token}`
    }
})
if (api.error) {
    throw Error("API")
}