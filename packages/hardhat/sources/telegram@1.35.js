if (secrets.up != args[1]) {
    throw Error("UP")
}

secrets.token = JSON.parse(secrets.token);

function bufferToHex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

async function createSHA256Hash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return hashBuffer;
}

async function createHMACSHA256(data, key) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const keyBuffer = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        false,
        ['sign']
    );
    const hmacBuffer = await crypto.subtle.sign('HMAC', keyBuffer, dataBuffer);
    return hmacBuffer;
}

const secret = await createSHA256Hash(secrets.token.bot);
const calculatedHMAC = await createHMACSHA256(secrets.token.data.dataStr, secret);
const calculatedHash = bufferToHex(calculatedHMAC);

if (calculatedHash != secrets.token.data.hash) {
    throw Error("Telegram");
}

const idLine = secrets.token.data.dataStr.split('\n').find(line => line.startsWith('id='));
const id = idLine ? idLine.split('=')[1] : null;
if (id != args[0]) {
    throw Error("ID")
}

const api = await Functions.makeHttpRequest({
    url: `https://api.telegram.org/bot${secrets.token.bot}/getChat?chat_id=${id}`,
    method: "GET",
})
if (api.error) {
    throw Error("API")
}

if (api.data.result.personal_chat) {
    const api2 = await Functions.makeHttpRequest({
        url: `https://api.tgstat.ru/channels/stat?token=${secrets.token.tgstat}&channelId=${api.data.result.personal_chat.id}`,
        method: "GET",
    })
    if (api2.error) {
        throw Error("TGStat API")
    }
    api.data.result.tgstat = api2.data.response;
}

const pinataContent = api.data.result;

const ipfs = await Functions.makeHttpRequest({
    url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    method: "POST",
    headers: {
        "Authorization": `Bearer ${secrets.pinata}`,
        "Content-Type": "application/json"
    },
    data: {
        pinataContent,
    }
})
if (ipfs.error) {
    throw Error("IPFS")
}
return Functions.encodeString(ipfs.data.IpfsHash)