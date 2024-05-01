import { ethers } from "ethers";
import { SecretsManager } from "@chainlink/functions-toolkit";
import pinata from "~~/lib/pinata";
import { getUserData } from "./provider";

export type PreparedRequest = {
    user: object,
    pin: object,
    secret: number
}

export async function prepareRequest(
    source: string,
    token: string
): Promise<PreparedRequest> {

    const user = await getUserData(source, token);
    const pin = await pinata.pinJSONToIPFS(user);

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
    return {
        user,
        pin,
        secret: uploadResult.version,
    };
}
