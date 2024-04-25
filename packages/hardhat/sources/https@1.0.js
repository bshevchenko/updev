const [id, up] = args;
const response = await Functions.makeHttpRequest({
    url: `https://${id}/updev.json`,
    method: "GET"
});
if (response.error) {
    throw Error("HTTPs fail");
}
if (response.data.data.up !== up) {
    throw Error("Unexpected UP");
}
return Functions.encodeUint256(1);