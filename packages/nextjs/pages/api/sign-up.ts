import type { NextApiRequest, NextApiResponse } from "next"
import axios from "axios";
import { DefenderRelaySigner, DefenderRelayProvider } from "@openzeppelin/defender-relay-client/lib/ethers";
import { ethers } from "ethers";
import { RelayerParams } from "@openzeppelin/defender-relay-client";
import deployedContracts from "~~/contracts/deployedContracts";
import externalContracts from "~~/contracts/externalContracts";

const chainId: string = process.env.CHAIN_ID || "";

const delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));

type ResponseData = {
    up: string
}

export default async function SignUp (
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    // TODO Controller Auth signature. Add end-point for challenge generation. Rate limits?
    // TODO next-auth access token

    // TODO throw error if controllerAddress is already in upRegistry
    const controller = req.body.controller;

    // TODO bytecode; pass via req.body.profile. https://github.com/magalimorin18/relayer-example/blob/main/scripts/encode-data/encode-lsp3Profile.ts
    const lsp3Profile = "0x6f357c6a3e2e3b435dd1ee4b8a2435722ee5533ea3f6cf6cb44c7fc278ac57ea1480295e697066733a2f2f516d5861714d67646971664b7931384373574768534a4c62626136316f6676666857387175506e6e6a6e76625966";

    const { data } = await axios.post("https://relayer-api.testnet.lukso.network/v1/relayer/universal-profile", { // TODO testnet url
        lsp6ControllerAddress: [controller],
        lsp3Profile
    }, {
        headers: {
            "Authorization": "Bearer " + process.env.LUKSO_RELAYER_API_KEY,
            "Content-Type": "application/json"
        }
    });

    // TODO Explorer API takes some time to get new tx data. I asked Magali to include deployment data in Relayer API response...
    // TODO ...try to get deployment data via transaction receipt?
    await delay(5000);

    // TODO use Lukso Explorer API to get deployment data
    const { data: { decoded_input: { parameters } } } = await axios.get(
        // TODO testnet url
        "https://explorer.execution.testnet.lukso.network/api/v2/transactions/" + data.transactionHash
    )

    const credentials: RelayerParams = {
        apiKey: process.env.DEFENDER_RELAYER_API_KEY || "",
        apiSecret: process.env.DEFENDER_RELAYER_API_SECRET || ""
    };

    const provider = new DefenderRelayProvider(credentials);
    const signer = new DefenderRelaySigner(credentials, provider, { speed: "fast" });

    const lsp23Factory = new ethers.Contract(
        (externalContracts as any)[chainId].LSP23Factory.address,
        (externalContracts as any)[chainId].LSP23Factory.abi,
        signer
    );
    const lsp23Tx = await lsp23Factory.deployERC1167Proxies(
        parameters[0].value,
        parameters[1].value,
        parameters[2].value,
        parameters[3].value,
    );
    const lsp23TxMined = await lsp23Tx.wait();
    console.log("lsp23TxMined", lsp23TxMined);

    const upRegistry = new ethers.Contract(
        (deployedContracts as any)[chainId].upRegistry.address,
        (deployedContracts as any)[chainId].upRegistry.abi,
        signer
    );
    const upRegistryTx = await upRegistry.setUP(data.universalProfileAddress, controller);
    const upRegistryTxMined = await upRegistryTx.wait();
    console.log("upRegistryTxMined", upRegistryTxMined);

    console.log("Deployed UP", data.universalProfileAddress);

    res.status(200).json({
        up: data.universalProfileAddress
    });
}
