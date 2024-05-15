import { NextApiRequest, NextApiResponse } from "next/types";
import { tokens } from "~~/lib/db";

type ResponseData = {
}

export default async function Tokens(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    res.status(200).json(
        await tokens.find({ up: req.query.up }).toArray()
    );
}
