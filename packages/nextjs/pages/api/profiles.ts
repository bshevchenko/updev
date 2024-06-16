import { NextApiRequest, NextApiResponse } from "next/types";
import { ups } from "~~/lib/db";

type ResponseData = object;

export default async function Profiles(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  let result = {};
  try {
    result = await ups.find({}).sort({ _id: -1 }).toArray();
  } catch (e) {}
  res.status(200).json(result);
}
