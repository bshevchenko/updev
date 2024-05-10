import { ethers } from "ethers";
import { SecretsManager } from "@chainlink/functions-toolkit";
import latestVersions from "../../hardhat/sources/latest.json";

export type PreparedRequest = {
    secret: number,
    version: string
}

export async function prepareRequest(
    up: string,
    source: string,
    token: string,
    id?: string
): Promise<PreparedRequest> {
    // @ts-ignore
    const version = latestVersions[source];

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

    // encrypt secrets and upload to DON
    const secretsManager = new SecretsManager({
        // TODO pass subscription ownership to Defender relayer and use it here? or create subscription from Defender relayer?
        signer: new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY || "", provider),
        functionsRouterAddress: process.env.DON_ROUTER || "",
        donId: process.env.DON_ID_STRING || "",
    });
    await secretsManager.initialize();
    const encryptedSecretsObj = await secretsManager.encryptSecrets({
        token,
        up: up.slice(2).toLowerCase(),
        pinata: process.env.PINATA_JWT || ""
    });
    const uploadResult = await secretsManager.uploadEncryptedSecretsToDON({
        encryptedSecretsHexstring: encryptedSecretsObj.encryptedSecrets,
        gatewayUrls: [
            process.env.DON_GATEWAY_URL_1 || "",
            process.env.DON_GATEWAY_URL_2 || "",
        ],
        slotId: 0,
        minutesUntilExpiration: 10,
    });
    if (!uploadResult.success) {
        throw new Error("Encrypted secrets not uploaded to DON");
    }
    return {
        secret: uploadResult.version,
        version
    };
}
