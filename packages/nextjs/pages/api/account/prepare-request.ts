import axios from "axios";
import pinataSDK from "@pinata/sdk";
import { SecretsManager } from "@chainlink/functions-toolkit";
import { ethers } from 'ethers';

// TODO free pinata tier has only 500 Pinned Files max. switch to Filebase or pay for another tier?
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET)

export async function POST(req: Request) {
    try {
        // request user data
        const result = await axios.get( // TODO dynamic API URL. pass provider & version in req.body?
            "https://api.twitter.com/2/users/me?user.fields=created_at,description,location,most_recent_tweet_id,pinned_tweet_id,profile_image_url,protected,public_metrics,url,verified,verified_type,withheld",
            { headers: { Authorization: "Bearer " + req.body.token } }
        );

        // pin user data to IPFS
        const pin = await pinata.pinJSONToIPFS(result.data.data);

        // encrypt secrets and upload to DON
        const secretsManager = new SecretsManager({
            signer: new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY),
            functionsRouterAddress: process.env.DON_ROUTER,
            donId: process.env.DON_ID,
        });
        await secretsManager.initialize();
        const encryptedSecretsObj = await secretsManager.encryptSecrets({
            token: req.body.token
        });
        const uploadResult = await secretsManager.uploadEncryptedSecretsToDON({
            encryptedSecretsHexstring: encryptedSecretsObj.encryptedSecrets,
            gatewayUrls: [
                process.env.DON_GATEWAY_URL_1,
                process.env.DON_GATEWAY_URL_2,
            ],
            slotId: 0,
            minutesUntilExpiration: 30,
        });
        if (!uploadResult.success)
            throw new Error("Encrypted secrets not uploaded to DON");

        // return everything
        res.json({
            user: result.data.data,
            pin,
            secret: parseInt(uploadResult.version),
        })
    } catch (e) {
        console.error(e);
        res.status(500)
    }
}
