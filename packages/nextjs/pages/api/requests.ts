import { NextApiRequest, NextApiResponse } from "next/types";
import { requests } from "~~/lib/db";

type ResponseData = {
}

export default async function Requests(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    let filter = { // pending
        up: req.query.up,
        $or: [
            { isFulfilled: false },
            {
                $and: [
                    { isFulfilled: true },
                    { isOK: true },
                    { isClaimed: false },
                ]
            }
        ]
    };
    res.status(200).json(
        await requests.find(filter).toArray()
    );
}
