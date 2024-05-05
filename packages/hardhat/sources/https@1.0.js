const response = await Functions.makeHttpRequest({
    url: `https://${args[0]}/updev.json`,
    method: "GET"
})
if (response.error) {
    throw Error("HTTPs")
}
if (response.data.up != args[2]) {
    throw Error("UP")
}
return Functions.encodeUint256(1)