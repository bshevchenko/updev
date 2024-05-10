import mongoPromise from "~~/lib/db/clientPromise";

const mongo = await mongoPromise;

export const db = mongo.db(process.env.MONGODB_NAME);

export const sources = db.collection("sources");
export const requests = db.collection("requests");
export const tokens = db.collection("tokens");
