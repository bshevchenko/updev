import { NextApiRequest, NextApiResponse } from "next/types";
import { getAccountBySession } from "~~/lib/db";
import { getUserData } from "~~/lib/provider";

export default async function Session(req: NextApiRequest, res: NextApiResponse) {
    // TODO salt session token?
    const account = await getAccountBySession(req);
    // TODO retun userData
    // getUserData(account.provider, account.access_token) // TODO cache user data
    res.status(200).json(
        account
    );
}
