const [ipfsHash, id] = args;
const twitter = await Functions.makeHttpRequest({
    url: 'https://api.twitter.com/2/users/me?user.fields=created_at,description,location,most_recent_tweet_id,pinned_tweet_id,profile_image_url,protected,public_metrics,url,verified,verified_type,withheld',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${secrets.token}`
    }
});
if (twitter.error) {
    throw Error('Twitter fail');
}
const ipfs = await Functions.makeHttpRequest({
    url: 'https://gateway.pinata.cloud/ipfs/' + ipfsHash,
    method: 'GET'
});
if (ipfs.error) {
    throw Error('IPFS fail');
}
if (twitter.data.data.username !== id || ipfs.data.username !== id) { // TODO id is not username
    throw Error('Username fail ' + twitter.data.data.username + ' ' + ipfs.data.username + ' ' + id);
}
// TODO throw error if twitter.data.data != ipfs.data. allow some % of divergence in ?.data.public_metrics
return Functions.encodeUint256(1);