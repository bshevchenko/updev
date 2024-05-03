import mongoPromise from "~~/lib/db/clientPromise";

const mongo = await mongoPromise;

export const db = mongo.db(process.env.MONGODB_NAME);
export const users = db.collection("users");
export const accounts = db.collection("accounts");

export const getAccountByUserId = async (userId: string = "") => {
    const account = await accounts.findOne({ userId });
    if (!account) {
        throw new Error("invalid account");
    }
    const user = await users.findOne(userId);
    if (!user) {
        throw new Error("invalid user");
    }
    account.user = user;
    return account;
}
