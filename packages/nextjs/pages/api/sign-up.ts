import type { NextApiRequest, NextApiResponse } from "next"
import axios from "axios";
import { ethers } from "ethers";
import { hashMessage } from "@ethersproject/hash";
import { DefenderRelaySigner, DefenderRelayProvider } from "@openzeppelin/defender-relay-client/lib/ethers";
import { RelayerParams } from "@openzeppelin/defender-relay-client";
import deployedContracts from "~~/contracts/deployedContracts";
import clientPromise from "~~/lib/db";

import LSP23Factory from "@lukso/lsp-smart-contracts/artifacts/LSP23LinkedContractsFactory.json";

const delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));

type ResponseData = {
    up: string
}

export default async function SignUp(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const sessionToken = req.cookies["__Secure-next-auth.session-token"] || "";
    const mongo = await clientPromise;
    const db = mongo.db("test"); // TODO db name
    const collection = db.collection("sessions");

    const session = await collection.findOne({ sessionToken });
    if (!session || (new Date() > new Date(session.expires))) {
        throw new Error("invalid session");
    }

    const { controller, signature, token } = req.body;

    if (token !== sessionToken) {
        throw new Error("invalid session token");
    }

    if (ethers.utils.recoverAddress(hashMessage(sessionToken), signature) !== controller) {
        throw new Error("invalid signature");
    }

    const credentials: RelayerParams = {
        apiKey: process.env.DEFENDER_RELAYER_API_KEY || "",
        apiSecret: process.env.DEFENDER_RELAYER_API_SECRET || ""
    };
    const provider = new DefenderRelayProvider(credentials);
    const signer = new DefenderRelaySigner(credentials, provider, { speed: "fast" });

    const chainId: string = process.env.CHAIN_ID || "";
    const upRegistry = new ethers.Contract(
        (deployedContracts as any)[chainId].upRegistry.address,
        (deployedContracts as any)[chainId].upRegistry.abi,
        signer
    );

    if (await upRegistry.up(controller) != "0x0000000000000000000000000000000000000000") {
        throw new Error("already signed up");
    }

    // TODO bytecode; pass via req.body.profile. https://github.com/magalimorin18/relayer-example/blob/main/scripts/encode-data/encode-lsp3Profile.ts
    const lsp3Profile = "0x6f357c6a3e2e3b435dd1ee4b8a2435722ee5533ea3f6cf6cb44c7fc278ac57ea1480295e697066733a2f2f516d5861714d67646971664b7931384373574768534a4c62626136316f6676666857387175506e6e6a6e76625966";

    const { data } = await axios.post("https://relayer-api.testnet.lukso.network/v1/relayer/universal-profile", { // TODO testnet url, env
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
    const { data: { decoded_input: { parameters } } } = await axios.get( // TODO testnet url, env?
        "https://explorer.execution.testnet.lukso.network/api/v2/transactions/" + data.transactionHash
    )

    const lsp23Factory = new ethers.Contract(
        "0x2300000a84d25df63081feaa37ba6b62c4c89a30",
        LSP23Factory.abi,
        signer
    );
    const lsp23Tx = await lsp23Factory.deployERC1167Proxies(
        parameters[0].value,
        parameters[1].value,
        parameters[2].value,
        parameters[3].value,
    );
    await lsp23Tx.wait();

    const upRegistryTx = await upRegistry.setUP(data.universalProfileAddress, controller);
    await upRegistryTx.wait();

    res.status(200).json({
        up: data.universalProfileAddress
    });
}
