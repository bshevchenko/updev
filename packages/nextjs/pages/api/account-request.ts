import axios from "axios";
import { ethers } from "ethers";
import { SecretsManager } from "@chainlink/functions-toolkit";
import { NextApiRequest, NextApiResponse } from "next/types";
import pinata from "~~/lib/pinata";
import URLs from "../../../hardhat/sources/urls.json"

type ResponseData = {
    user: object,
    pin: object,
    secret: number
}

export default async function AccountRequest(req: NextApiRequest, res: NextApiResponse<ResponseData>) {

    const { token } = req.body;

    // request user data
    const result = await axios.get( // @ts-ignore
        URLs[source],
        { headers: { Authorization: "Bearer " + token } }
    );

    // pin user data to IPFS
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
    if (!uploadResult.success) {
        throw new Error("Encrypted secrets not uploaded to DON");
    }

    // return everything
    res.status(200).json({
        user: result.data.data,
        pin,
        secret: uploadResult.version,
    });
}
