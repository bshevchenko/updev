import { NextApiRequest, NextApiResponse } from "next/types";
import Moralis from "moralis";
import { upDevAccountNFT } from "~~/lib/contracts";
import { requests } from "~~/lib/db";

type ResponseData = {
}

interface Fulfilled {
    requestId: string,
    up: string,
    tokenId: string,
    isOK: boolean
}

export default async function Fulfilled(req: NextApiRequest, res: NextApiResponse<ResponseData>) {

    const logs = Moralis.Streams.parsedLogs<Fulfilled>(req.body);

    for (let event of logs) {
        console.log("Fulfilled", event);
        await requests.updateOne({ requestId: event.requestId }, {
            $set: {
                isFulfilled: true,
                isClaimed: false,
                isOK: event.isOK
            },
        });
        if (event.isOK) {
            const tx = await upDevAccountNFT.claim(event.tokenId);
            await tx.wait();
        }
    }

    res.status(200).json({});
}
