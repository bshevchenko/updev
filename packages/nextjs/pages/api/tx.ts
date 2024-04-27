import { ethers } from "ethers";
import { DefenderRelaySigner, DefenderRelayProvider } from "@openzeppelin/defender-relay-client/lib/ethers";
import { RelayerParams } from "@openzeppelin/defender-relay-client";
import { NextApiRequest, NextApiResponse } from "next/types";
import KeyManager from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";

type ResponseData = {
    hash: string,
}

// https://docs.lukso.tech/learn/expert-guides/key-manager/execute-relay-transactions/

export default async function Transaction(req: NextApiRequest, res: NextApiResponse<ResponseData>) {

    // TODO verify if up is within upRegistry (or check by duplicate in DB?). rate limits?

    const { up, signature, nonce, validityTimestamps, abiPayload } = req.body;

    const keyManagerAddress = ""; // TODO get by up?

    const credentials: RelayerParams = {
        apiKey: process.env.DEFENDER_RELAYER_API_KEY || "",
        apiSecret: process.env.DEFENDER_RELAYER_API_SECRET || ""
    };
    const provider = new DefenderRelayProvider(credentials);
    const signer = new DefenderRelaySigner(credentials, provider, { speed: "fast" });

    const keyManager = new ethers.Contract(
        keyManagerAddress,
        KeyManager.abi,
        signer
    ); // TODO verify tx validity before using gas relayer? or it will anyway fail on a dry-run?
    const tx = await keyManager.executeRelayCall(signature, nonce, validityTimestamps, abiPayload);
    await tx.mined();

    res.status(200).json({
        hash: tx.hash,
    });
}
