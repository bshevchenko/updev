import { NextApiRequest, NextApiResponse } from "next/types";

type ResponseData = {
    token: string,
}

export default async function Session(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    res.status(200).json({
        token: req.cookies["__Secure-next-auth.session-token"] || ""
    });
}
