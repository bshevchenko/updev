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
    const session = await sessions.findOne({
        sessionToken,
        expires: { $gte: new Date() }
    });
    if (!session) {
        throw new Error("invalid session");
    }
    const account = await accounts.findOne({ userId: session.userId });
    if (!account) {
        throw new Error("invalid account");
    }
    const user = await users.findOne(session.userId);
    if (!user) {
        throw new Error("invalid user");
    }

    account.session = session;
    account.user = user;

    return account;
}
