import mongoPromise from "~~/lib/db/clientPromise";

const mongo = await mongoPromise;

export const db = mongo.db(process.env.MONGODB_NAME);
export const sessions = db.collection("sessions");
export const users = db.collection("users");
