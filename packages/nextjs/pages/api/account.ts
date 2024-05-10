import { NextApiRequest, NextApiResponse } from "next/types";
import { ethers, utils } from "ethers";
import { hashMessage } from "@ethersproject/hash";
import { isEmptyAddress, upDevAccountNFT, upRegistry } from "~~/lib/contracts";
import { prepareRequest } from "~~/lib/don";

type ResponseData = {
}

export default async function Account(req: NextApiRequest, res: NextApiResponse<ResponseData>) {

    const { up, provider, token, id, signature } = req.body;

    const controller = await upRegistry.controller(up);
    if (isEmptyAddress(controller)) {
        throw new Error("not allowed");
    }
    const message = utils.keccak256(utils.toUtf8Bytes(token + id));
    if (ethers.utils.recoverAddress(hashMessage(message), signature) !== controller) {
        throw new Error("invalid signature");
    }

    console.log("Preraing request...");
    const request = await prepareRequest(
        up,
        provider,
        token,
        id
    );

    console.log("Sending request...");
    const accountTx = await upDevAccountNFT.sendRequest(
        up,
        request.secret,
        provider,
        request.version,
        id
    );
    await accountTx.wait();

    console.log("Request sent");

    res.status(200).json({
    });
}
