const express = require('express')
const axios = require('axios')
const app = express()
const cors = require('cors')
const pinataSDK = require('@pinata/sdk')
const { SecretsManager, createGist } = require("@chainlink/functions-toolkit");
const ethers = require("ethers");

// TODO swtich to filebase or other???
const pinata = new pinataSDK('264ddaa528abb88dcc9e', '416d9e037bfd6d12a58f82271fcb5714952cbc9cfa10dad9b96bc7b1c1678468')

const routerAddress = "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C";
const donId = "fun-polygon-mumbai-1";

const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF");

const wallet = new ethers.Wallet("d28af36112418853f138f652e46bd7dd05472964c5f5e00d0ea893b4d961370c");
const signer = wallet.connect(provider);

app.use(cors());

app.get('/', async function (req, res) {
    try {
        // request user data
        const result = await axios.get( // TODO X entities?
            'https://api.twitter.com/2/users/me?user.fields=created_at,description,location,most_recent_tweet_id,pinned_tweet_id,profile_image_url,protected,public_metrics,url,verified,verified_type,withheld',
            { headers: { Authorization: "Bearer " + req.query.token } }
        );
        console.log('result', result.data.data);

        // upload user data to IPFS
        const pin = await pinata.pinJSONToIPFS(result.data.data);
        console.log('pin', pin);

        // encrypt secrets and upload to DON
        const secretsManager = new SecretsManager({
            signer: signer,
            functionsRouterAddress: routerAddress,
            donId: donId,
        });
        await secretsManager.initialize();

        const encryptedSecretsObj = await secretsManager.encryptSecrets({
            token: req.query.token
        });

        // TODO use DON hosted secrets instead of Gists?
        const githubApiToken = "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";
        const gistURL = await createGist(
            githubApiToken,
            JSON.stringify(encryptedSecretsObj)
        );
        const secret = await secretsManager.encryptSecretsUrls([
            gistURL,
        ]);
        console.log('secret', secret);

        // return everything
        res.json({
            user: result.data.data,
            pin,
            secret,
        })
    } catch (e) {
        console.error(e);
        res.status(500)
    }
})

app.listen(8000, () => {
    console.log('Listening http://localhost:8000...');
})
