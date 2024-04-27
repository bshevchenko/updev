import axios from "axios";
import { ethers } from "ethers";
import pinataSDK from "@pinata/sdk";
import { SecretsManager } from "@chainlink/functions-toolkit";
import { NextApiRequest, NextApiResponse } from "next/types";

type ResponseData = {
    user: object,
    pin: object,
    secret: number
}

export default async function AccountRequest(req: NextApiRequest, res: NextApiResponse<ResponseData>) {

    const { token } = req.body;

    // request user data
    // TODO dynamic API URL. pass provider & version in req.body?
    // TODO use user data from next-auth DB since it should be already there (check timestamp & necessary fields tho)
    const result = await axios.get(
        "https://api.twitter.com/2/users/me?user.fields=created_at,description,location,most_recent_tweet_id,pinned_tweet_id,profile_image_url,protected,public_metrics,url,verified,verified_type,withheld",
        { headers: { Authorization: "Bearer " + token } }
    );

    // pin user data to IPFS
    // TODO free pinata tier has only 500 Pinned Files max. Filebase? Or Lukso? https://github.com/lukso-network/tools-data-providers
    const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
    const pin = await pinata.pinJSONToIPFS(result.data.data);

    // encrypt secrets and upload to DON
    const secretsManager = new SecretsManager({
        signer: new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY || ""),
        functionsRouterAddress: process.env.DON_ROUTER || "",
        donId: process.env.DON_ID || "",
    });
    await secretsManager.initialize();
    const encryptedSecretsObj = await secretsManager.encryptSecrets({ token });
    const uploadResult = await secretsManager.uploadEncryptedSecretsToDON({
        encryptedSecretsHexstring: encryptedSecretsObj.encryptedSecrets,
        gatewayUrls: [
            process.env.DON_GATEWAY_URL_1 || "",
            process.env.DON_GATEWAY_URL_2 || "",
        ],
        slotId: 0,
        minutesUntilExpiration: 30,
    });
    if (!uploadResult.success)
        throw new Error("Encrypted secrets not uploaded to DON");

    // return everything
    res.status(200).json({
        user: result.data.data,
        pin,
        secret: uploadResult.version,
    });
}
