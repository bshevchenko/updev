const url = "https://api.twitter.com/2/users/me?user.fields=id,created_at,username,verified,verified_type,public_metrics";

{snippets/api}

const pinataContent = api.data.data;
const id = api.data.data.id;

{snippets/ipfs}