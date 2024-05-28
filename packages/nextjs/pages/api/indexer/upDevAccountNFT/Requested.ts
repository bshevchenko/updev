import { NextApiRequest, NextApiResponse } from "next/types";
import Moralis from "moralis";
import { requests } from "~~/lib/db";

export const config = {
  maxDuration: 60,
};

type ResponseData = object;

interface Requested {
  requestId: string;
  up: string;
  tokenId: string;
  provider: string;
  version: string;
  id: string;
}

export default async function Requested(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const logs = Moralis.Streams.parsedLogs<Requested>(req.body);

  for (const req of logs) {
    console.log("Requested", req);
    await requests.insertOne({
      ...req,
      isFulfilled: false,
    });
  }

  res.status(200).json({});
}
