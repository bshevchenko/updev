const express = require('express')
const axios = require('axios')
const app = express()
const cors = require('cors')
const pinataSDK = require('@pinata/sdk')
const { SecretsManager, createGist } = require("@chainlink/functions-toolkit");
const ethers = require("ethers");

// TODO swtich to filebase or other?
const pinata = new pinataSDK('264ddaa528abb88dcc9e', '416d9e037bfd6d12a58f82271fcb5714952cbc9cfa10dad9b96bc7b1c1678468')

const routerAddress = "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C";
const donId = "fun-polygon-mumbai-1";

const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF");

const wallet = new ethers.Wallet("d28af36112418853f138f652e46bd7dd05472964c5f5e00d0ea893b4d961370c");
const signer = wallet.connect(provider);

app.use(cors());

app.post('/sign-up', async function (req, res) {
    // TODO deploy new UP on Lukso Mainnet via Relayer API (what about rate limits?)
    //   curl -X 'POST' \
    //   'https://relayer-api.testnet.lukso.network/v1/relayer/universal-profile' \
    //   -H 'accept: application/json' \
    //   -H 'Authorization: Bearer ' \ // TODO get api key from .env
    //   -H 'Content-Type: application/json' \
    //   -d '{
    //   "lsp6ControllerAddress":["0x240588CeBBd7C2f7e146A9fC1F357C82A9C052DC"],
    //   "lsp3Profile": "0x6f357c6a3e2e3b435dd1ee4b8a2435722ee5533ea3f6cf6cb44c7fc278ac57ea1480295e697066733a2f2f516d5861714d67646971664b7931384373574768534a4c62626136316f6676666857387175506e6e6a6e76625966"
    // }'
    // Response body
    // {
    //   "taskUuid": "79c53ff5-0dfa-4ae4-b608-9d41e7087572",
    //   "universalProfileAddress": "0x6a61454fCE3770E533E7E005474e9E8086ca1E95",
    //   "transactionHash": "0x0a7c6fb808875ccab0447f949ac8f64618e26dded4113234938723ef3e5e5487"
    // }

    // TODO deploy created UP on Sepolia via Defender gas relayer
    // const lsp23Factory = await hre.ethers.getContractAt("LSP23LinkedContractsFactory", LSP23_FACTORY_ADDRESS, deployer);
    // const upTX = await lsp23Factory.deployERC1167Proxies(
    //   [
    //     "0x2c4988eef2926f98ec30edbdd6d30798c97393cf67fd6704fa1cd3eca6326b67",
    //     "0",
    //     "0x3024d38ea2434ba6635003dc1bdc0dab5882ed4f",
    //     "0xc4d66de8000000000000000000000000000000000066093407b6704b89793beffd0d8f00"
    //   ],
    //   [
    //     "0",
    //     "0x2fe3aed98684e7351ad2d408a43ce09a738bf8a4",
    //     "0xc4d66de8",
    //     "true",
    //     "0x"
    //   ],
    //   "0x000000000066093407b6704b89793beffd0d8f00",
    //   "0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000004df30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3df30dba06db6a30e65354d9a64c60986000000000000000000000000000000004b80742de2bf82acb3630000240588cebbd7c2f7e146a9fc1f357c82a9c052dc5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc50000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014240588cebbd7c2f7e146a9fc1f357c82a9c052dc000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000007f3f0600000000000000000000000000000000000000000000000000000000000000596f357c6a3e2e3b435dd1ee4b8a2435722ee5533ea3f6cf6cb44c7fc278ac57ea1480295e697066733a2f2f516d5861714d67646971664b7931384373574768534a4c62626136316f6676666857387175506e6e6a6e7662596600000000000000",
    // );
    // const receipt = await upTX.wait();
    // console.log('RECEIPT', receipt);
});

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
