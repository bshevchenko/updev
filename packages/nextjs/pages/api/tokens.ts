import { NextApiRequest, NextApiResponse } from "next/types";
import { tokens } from "~~/lib/db";

type ResponseData = {
}

export default async function Tokens(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    let result = {};
    try {
        result = await tokens.find({ up: req.query.up }).toArray()
    } catch (e) {}
    res.status(200).json(
        result
    );
}
