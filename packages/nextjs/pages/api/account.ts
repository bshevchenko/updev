import { NextApiRequest, NextApiResponse } from "next/types";
import { hashMessage } from "@ethersproject/hash";
import { ethers, utils } from "ethers";
import { isEmptyAddress, upDevAccountNFT, upRegistry } from "~~/lib/contracts";
import { prepareRequest } from "~~/lib/don";

export const config = {
  maxDuration: 60,
};

type ResponseData = object;

export default async function Account(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { up, provider, token, id, signature } = req.body;

  if (!up) {
    throw new Error("Invalid UP");
  }

  const controller = await upRegistry.controller(up);
  if (isEmptyAddress(controller)) {
    throw new Error("not allowed");
  }
  const message = utils.keccak256(utils.toUtf8Bytes(token + id));
  if (ethers.utils.recoverAddress(hashMessage(message), signature) !== controller) {
    throw new Error("invalid signature");
  }

  console.log("Preparing request...");
  const request = await prepareRequest(up, provider, token);

  console.log("Sending request...");
  const accountTx = await upDevAccountNFT.sendRequest(up, request.secret, provider, request.version, id);
  await accountTx.wait();

  console.log("Request sent");

  res.status(200).json({});
}
