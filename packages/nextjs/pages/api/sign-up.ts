import type { NextApiRequest, NextApiResponse } from "next"
import axios from "axios";
import { ethers } from "ethers";
import { hashMessage } from "@ethersproject/hash";
import ERC725 from "@erc725/erc725.js";
import LSP3Schema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import pinata from "~~/lib/pinata";
import { getDeploymentData } from "~~/lib/up";
import { upRegistry, upDevAccountNFT, lsp23Factory, isEmptyAddress } from "~~/lib/contracts";
import { prepareRequest } from "~~/lib/don";

const erc725 = new ERC725(LSP3Schema);

type ResponseData = {
    up: string
}

export default async function SignUp(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    // TODO get & verify interests tags (tokenIds)
    // TODO userpic, cover
    const { controller, signature, name, description, location, isCompany, provider, token, id, image } = req.body;

    if (ethers.utils.recoverAddress(hashMessage(token), signature) !== controller) {
        throw new Error("invalid signature");
    }
    if (!isEmptyAddress(await upRegistry.up(controller))) {
        throw new Error("already signed up");
    }
    if (name.length < 3 || name.length > 40) { // TODO increase max name.length?
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
            isCompany: !!isCompany,
            profileImage: [
                {
                    // width: 1024, // TODO
                    // height: 1024,
                    url: image,
                    // verification: {
                    //     method: "keccak256(bytes)",
                    //     data: ethers.utils.keccak256(`0x${profileImg}`),
                    // },
                },
            ],
            // backgroundImage: [],
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
    const { data } = await axios.post(process.env.LUKSO_RELAYER_API_URL + "/v1/relayer/universal-profile", {
        lsp6ControllerAddress: [controller],
        lsp3Profile: values[0]
    }, {
        headers: {
            "Authorization": "Bearer " + process.env.LUKSO_RELAYER_API_KEY,
            "Content-Type": "application/json"
        }
    });
    const up = data.universalProfileAddress;
    const parameters = await getDeploymentData(data.transactionHash);

    console.log("Deploying UP on another chain...");
    const lsp23Tx = await lsp23Factory.deployERC1167Proxies(
        parameters[0].value,
        parameters[1].value,
        parameters[2].value,
        parameters[3].value,
    );
    await lsp23Tx.wait();

    console.log("Registering UP...");
    const upRegistryTx = await upRegistry.setUP(up, controller);
    await upRegistryTx.wait();

    // mint Account NFT for the created UP
    console.log("Preparing request for Account NFT...");
    const request = await prepareRequest(
        provider,
        token
    );
    console.log("Sending request for Account NFT...");
    const accountTx = await upDevAccountNFT.sendRequest(
        up,
        request.secret,
        provider,
        request.version,
        id,
        request.pin.IpfsHash
    );
    await accountTx.wait();

    // TODO claim here or via relayer? we need to wait for Fulfilled event first. so prob via relayer
    // const tokenId = ethers.utils.solidityKeccak256(["string", "string"], [account.provider, account.providerAccountId]);
    // console.log("Claiming Account NFT", tokenId);
    // const claimTx = await upDevAccountNFT.claim(tokenId);
    // await claimTx.wait();

    // TODO mintBatch Group Member NFTs on Lukso here? // TODO won't be possible without UP permissions rn

    console.log("Done! UP:", up);
    res.status(200).json({
        up
    });
}
