import { ethers } from "ethers";
import { SecretsManager } from "@chainlink/functions-toolkit";
import { PinataPinResponse } from "@pinata/sdk";
import pinata from "~~/lib/pinata";
import { getUserData } from "./provider";
import latestVersions from "../../hardhat/sources/latest.json";

export type PreparedRequest = {
    user: object,
    pin: PinataPinResponse,
    secret: number,
    version: string
}

export async function prepareRequest(
    source: string,
    token: string
): Promise<PreparedRequest> {

    const { data: user } = await getUserData(source, token);
    
    // @ts-ignore
    const version = latestVersions[source];

    const pin = await pinata.pinJSONToIPFS(user);

    // TODO save user data to mongo db?

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

    // encrypt secrets and upload to DON
    const secretsManager = new SecretsManager({
        // TODO try to whitelist Defender relayer and use it here
        signer: new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY || "", provider),
        functionsRouterAddress: process.env.DON_ROUTER || "",
        donId: process.env.DON_ID_STRING || "",
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
        version
    };
}
