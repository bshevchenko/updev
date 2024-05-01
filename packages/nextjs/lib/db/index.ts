import { NextApiRequest } from "next";
import mongoPromise from "~~/lib/db/clientPromise";

const mongo = await mongoPromise;

export const db = mongo.db(process.env.MONGODB_NAME);
export const sessions = db.collection("sessions");
export const users = db.collection("users");
export const accounts = db.collection("accounts");

export const getAccountBySession = async (req: NextApiRequest) => {
    const sessionToken = req.cookies["__Secure-next-auth.session-token"] || "";
    if (sessionToken === "") {
        throw new Error("invalid session token");
    }
    const session = await sessions.findOne({ sessionToken });  // TODO where Date is not expired
    if (!session || (new Date() > new Date(session.expires))) {
        throw new Error("invalid session");
    }
    const account = await accounts.findOne({ userId: session.userId }); // TODO merge two mongo queries into one?
    if (!account) {
        throw new Error("invalid account");
    }
    account.session = session;
    return account;
}
