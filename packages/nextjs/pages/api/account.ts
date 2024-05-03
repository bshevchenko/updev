import { NextApiRequest, NextApiResponse } from "next/types";
import { isEmptyAddress, upDevAccountNFT, upRegistry } from "~~/lib/contracts";
import { getAccountBySession } from "~~/lib/db";
import { prepareRequest } from "~~/lib/don";

type ResponseData = {
}

export default async function Account(req: NextApiRequest, res: NextApiResponse<ResponseData>) {

    const { up } = req.body;

    if (isEmptyAddress(await upRegistry.controller(up))) {
        throw new Error("not allowed");
    }

    const account = await getAccountBySession(req);
    const request = await prepareRequest(
        account.provider,
        account.access_token
    );

    const accountTx = await upDevAccountNFT.sendRequest(
        up,
        request.secret,
        account.provider,
        request.version,
        account.providerAccountId,
        request.pin.IpfsHash
    );
    await accountTx.wait();

    res.status(200).json({
    });
}
