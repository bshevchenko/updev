import { NextApiRequest, NextApiResponse } from "next/types";

type ResponseData = {
    token: string,
}

export default async function Session(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    res.status(200).json({ // TODO add salt? and rename Session into Challenge?
        token: req.cookies["__Secure-next-auth.session-token"] || ""
    });
}
