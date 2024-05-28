import { NextApiRequest, NextApiResponse } from "next/types";
import Moralis from "moralis";
import { sources } from "~~/lib/db";

export const config = {
  maxDuration: 60,
};

type ResponseData = object;

interface NewSource {
  name: string;
  version: string;
}

export default async function NewSource(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const logs = Moralis.Streams.parsedLogs<NewSource>(req.body);

  for (const source of logs) {
    // TODO is this for necessary or webhook always receive 1 event per request?
    console.log("NewSource", source);
    await sources.insertOne(source);
  }

  res.status(200).json({});
}
