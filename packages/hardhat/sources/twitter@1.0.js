const [id, ipfsHash] = args;
const twitter = await Functions.makeHttpRequest({
    url: "https://api.twitter.com/2/users/me?user.fields=created_at,description,id,location,most_recent_tweet_id,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,verified_type,withheld",
    method: "GET",
    headers: {
        "Authorization": `Bearer ${secrets.token}`
    }
});
if (twitter.error) {
    throw Error("Twitter fail");
}
const { data } = twitter.data;
const ipfs = await Functions.makeHttpRequest({
    url: "https://gateway.pinata.cloud/ipfs/" + ipfsHash, // TODO pass IPFS gateway in args?
    method: "GET"
});
if (ipfs.error) {
    throw Error("IPFS fail");
}
if (data.id != id || ipfs.data.id != id) {
    throw Error("ID fail");
}

const pm = data.public_metrics;
const ipfs_pm = ipfs.data.public_metrics;
delete data.public_metrics;
delete ipfs.data.public_metrics;

if (JSON.stringify(data) != JSON.stringify(ipfs.data)) {
    throw Error("Data fail");
}
if (JSON.stringify(pm) != JSON.stringify(ipfs_pm)) {
    if (!Object.keys(pm).every(key => 
        ipfs_pm.hasOwnProperty(key) &&
        Math.abs(pm[key] - ipfs_pm[key]) / pm[key] * 100 <= 5
    )) {
        throw Error("Metrics fail");
    }
    return Functions.encodeUint256(2);
}
return Functions.encodeUint256(1);