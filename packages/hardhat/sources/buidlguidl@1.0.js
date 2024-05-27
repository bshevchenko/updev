const api = await Functions.makeHttpRequest({
    url: "https://buidlguidl-v3.appspot.com/builders/" + args[0],
})
if (api.error) {
    throw Error("API")
}
if (!api.data.status.text.toLowerCase().includes(args[1])) {
    throw Error("UP")
}

const pinataContent = api.data;
const id = api.data.id;

{snippets/ipfs}