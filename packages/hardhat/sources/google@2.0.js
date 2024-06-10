const url = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json"

{snippets/api}

const api2 = await Functions.makeHttpRequest({
    url: "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    method: "GET",
    headers: {
        "Authorization": `Bearer ${secrets.token}`
    }
})
if (api2.error) {
    throw Error("API2")
}

api.data.youtube = api2.data;

const pinataContent = api.data;
const id = api.data.id;

{snippets/ipfs}