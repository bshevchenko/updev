import ERC725 from "@erc725/erc725.js";
import LSP3Schema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import { hashMessage } from "@ethersproject/hash";
import axios from "axios";
import { ethers, utils } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { isEmptyAddress, lsp23Factory, upDevAccountNFT, upRegistry } from "~~/lib/contracts";
import { ups } from "~~/lib/db";
import { prepareRequest } from "~~/lib/don";
import pinata from "~~/lib/pinata";
import { getDeploymentData } from "~~/lib/up";

export const config = {
  maxDuration: 60,
};

const erc725 = new ERC725(LSP3Schema);

type ResponseData = {
  up: string;
};

export default async function SignUp(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { controller, signature, provider, token, id, image } = req.body;
  let { isCompany, name, description, location } = req.body;

  isCompany = !!isCompany;
  name = name.trim();
  description = description.trim();
  location = location.trim();

  const message = utils.keccak256(utils.toUtf8Bytes(token + id));
  if (ethers.utils.recoverAddress(hashMessage(message), signature) !== controller) {
    throw new Error("invalid signature");
  }
  if (!isEmptyAddress(await upRegistry.up(controller))) {
    throw new Error("already signed up");
  }
  if (name.length < 3 || name.length > 40) {
    throw new Error("invalid name");
  }
  if (description.length < 12 || description.length > 160) {
    throw new Error("invalid description");
  }
  if (location.length > 30) {
    throw new Error("invalid location");
  }

  const json = {
    LSP3Profile: {
      name,
      description,
      location,
      isCompany,
      profileImage: [
        {
          url: image,
          // width: 1024, // TODO
          // height: 1024,
          // verification: {
          //     method: "keccak256(bytes)",
          //     data: ethers.utils.keccak256(`0x${profileImg}`),
          // },
        },
      ],
      // backgroundImage: [], // TODO
    },
  };
  const pin = await pinata.pinJSONToIPFS(json);
  const { values } = erc725.encodeData([
    {
      keyName: "LSP3Profile",
      value: {
        url: "ipfs://" + pin.IpfsHash,
        json,
      },
    },
  ]);
  console.log("Creating new UP...");
  const { data } = await axios.post(
    process.env.LUKSO_RELAYER_API_URL + "/v1/relayer/universal-profile",
    {
      lsp6ControllerAddress: [controller],
      lsp3Profile: values[0],
    },
    {
      headers: {
        Authorization: "Bearer " + process.env.LUKSO_RELAYER_API_KEY,
        "Content-Type": "application/json",
      },
    },
  );
  const up = data.universalProfileAddress;
  const parameters = await getDeploymentData(data.transactionHash);

  console.log("Deploying UP on another chain...");
  const lsp23Tx = await lsp23Factory.deployERC1167Proxies(
    parameters[0].value,
    parameters[1].value,
    parameters[2].value,
    parameters[3].value,
  );
  console.log("Preparing request for Account NFT...");
  const [request] = await Promise.all([prepareRequest(up, provider, token), lsp23Tx.wait()]);

  console.log("Registering UP...");
  console.log("Sending request for Account NFT...");

  await Promise.all([
    upRegistry.setUP(up, controller),
    upDevAccountNFT.sendRequest(up, request.secret, provider, request.version, id),
    ups.insertOne({
      up,
      controller,
      isCompany,
      provider,
      id,
      image,
      name,
      description,
      location,
    }),
  ]);

  console.log("Done! UP:", up);

  res.status(200).json({
    up,
  });
}
