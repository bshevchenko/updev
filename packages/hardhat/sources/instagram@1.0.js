const url = "https://graph.instagram.com/me?fields=id,username,account_type,name";

{snippets/api}

const pinataContent = api.data;
const id = api.data.id;

{snippets/ipfs}