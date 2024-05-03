import { NextApiRequest, NextApiResponse } from "next/types";
import { isEmptyAddress, upRegistry, keyManager } from "~~/lib/contracts";

type ResponseData = {
    hash: string,
}

// https://docs.lukso.tech/learn/expert-guides/key-manager/execute-relay-transactions/

// TODO Lukso network tx

export default async function Transaction(req: NextApiRequest, res: NextApiResponse<ResponseData>) {

    const { up, signature, nonce, validityTimestamps, abiPayload } = req.body;

    const kmAddress = await upRegistry.keyManager(up);
    if (isEmptyAddress(kmAddress)) {
        throw new Error("not signed up");
    }
    const km = keyManager(kmAddress);
    const tx = await km.executeRelayCall(signature, nonce, validityTimestamps, abiPayload);
    await tx.mined();

    res.status(200).json({
        hash: tx.hash,
    });
}
