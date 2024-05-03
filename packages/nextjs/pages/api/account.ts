import { NextApiRequest, NextApiResponse } from "next/types";
import { isEmptyAddress, upDevAccountNFT, upRegistry } from "~~/lib/contracts";
import { prepareRequest } from "~~/lib/don";

type ResponseData = {
}

export default async function Account(req: NextApiRequest, res: NextApiResponse<ResponseData>) {

    const { up, provider, token, id } = req.body;

    if (isEmptyAddress(await upRegistry.controller(up))) {
        throw new Error("not allowed");
    }

    console.log("Preraing request...");
    const request = await prepareRequest(
        provider,
        token
    );

    console.log("Sending request...");
    const accountTx = await upDevAccountNFT.sendRequest(
        up,
        request.secret,
        provider,
        request.version,
        id,
        request.pin.IpfsHash
    );
    await accountTx.wait();

    console.log("Request sent");

    res.status(200).json({
    });
}
