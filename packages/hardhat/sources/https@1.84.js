const response = await Functions.makeHttpRequest({
    url: `https://${args[0]}/updev.json`,
    method: "GET"
})
if (response.error) {
    throw Error("HTTPs")
}
if (response.data.up.toLowerCase().slice(2) != args[1]) {
    throw Error("UP")
}
return Functions.encodeUint256(1)