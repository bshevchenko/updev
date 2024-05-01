import { NextApiRequest, NextApiResponse } from "next/types";
import { getAccountBySession } from "~~/lib/db";
import { PreparedRequest } from "~~/lib/don";
import { getUserData } from "~~/lib/provider";

export default async function AccountMe(
    req: NextApiRequest,
    res: NextApiResponse<PreparedRequest>
) {
    const account = await getAccountBySession(req);
    res.status(200).json(
        await getUserData(
            account.provider,
            account.access_token
        )
    );
}
