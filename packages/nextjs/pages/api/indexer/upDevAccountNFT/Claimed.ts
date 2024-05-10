import { NextApiRequest, NextApiResponse } from "next/types";
import Moralis from "moralis";
import { ethers } from "ethers";
import axios from "axios";
import { requests, tokens } from "~~/lib/db";

type ResponseData = {
}

interface Claimed {
    requestId: string,
    up: string,
    tokenId: string,
    data: string
}

export default async function Claimed(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    
    const logs = Moralis.Streams.parsedLogs<Claimed>(req.body);

    for (let event of logs) {
        console.log("Claimed", event);
        let data = ethers.utils.toUtf8String(event.data);
        const request = await requests.findOneAndUpdate({ requestId: event.requestId }, {
            $set: {
                isClaimed: true,
                data
            },
        })
        if (!request) {
            throw new Error("Request not found");
        }
        const isIPFS = data.slice(0, 2) == "Qm";
        if (isIPFS) {
            const { data: ipfs } = await axios.get("https://gateway.pinata.cloud/ipfs/" + data);
            data = ipfs;
        }
        await tokens.insertOne({
            tokenId: event.tokenId,
            requestId: event.requestId,
            up: event.up,
            provider: request.provider,
            version: request.version,
            id: request.id,
            isIPFS,
            data
        })
    }

    res.status(200).json({});
}
