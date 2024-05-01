import { NextApiRequest, NextApiResponse } from "next/types";
import { getAccountBySession } from "~~/lib/db";
import { PreparedRequest, prepareRequest } from "~~/lib/don";

export default async function AccountRequest(
    req: NextApiRequest,
    res: NextApiResponse<PreparedRequest>
) {
    const account = await getAccountBySession(req);
    res.status(200).json(
        await prepareRequest(
            account.provider,
            account.access_token
        )
    );
}
