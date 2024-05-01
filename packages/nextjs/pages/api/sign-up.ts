import type { NextApiRequest, NextApiResponse } from "next"
import axios from "axios";
import { ethers } from "ethers";
import { hashMessage } from "@ethersproject/hash";
import ERC725 from "@erc725/erc725.js";
import LSP3Schema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import pinata from "~~/lib/pinata";
import { getDeploymentData } from "~~/lib/up";
import { upRegistry, lsp23Factory, isEmptyAddress } from "~~/lib/contracts";
import { getAccountBySession } from "~~/lib/db";
import { prepareRequest } from "~~/lib/don";

const erc725 = new ERC725(LSP3Schema);

type ResponseData = {
    up: string
}

// TODO it should mintBatch interests and mint account NFT using user data from provider...
// TODO ...we need to own user's UP until everything is minted

export default async function SignUp(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const account = await getAccountBySession(req);

    // TODO get & verify tags (tokenIds), location, userpic, cover, personal OR company profile
    const { controller, signature, name, description } = req.body;

    if (ethers.utils.recoverAddress(hashMessage(account.session.sessionToken), signature) !== controller) {
        throw new Error("invalid signature");
    }
    if (!isEmptyAddress(await upRegistry.up(controller))) {
        throw new Error("already signed up");
    }
    if (name.length < 3 || name.length > 40) { // TODO increase max name.length
        throw new Error("invalid name");
    }
    if (description.length < 12 || description.length > 160) {
        throw new Error("invalid description");
    }

    const json = {
        LSP3Profile: {
            name,
            description,
            profileImage: [
                {
                    // width: 1024, // TODO remove?
                    // height: 1024,
                    url: user.image, // TODO
                    // verification: {
                    //     method: "keccak256(bytes)",
                    //     data: ethers.utils.keccak256(`0x${profileImg}`),
                    // },
                },
            ],
            // backgroundImage: [],
        },
    };
    const pin = await pinata.pinJSONToIPFS(json); // TODO remove? we can prob use just json
    const { values } = erc725.encodeData([
        {
            keyName: "LSP3Profile",
            value: {
                url: "ipfs://" + pin.IpfsHash,
                json,
            },
        },
    ]);
    const { data } = await axios.post(process.env.LUKSO_RELAYER_API_URL + "/v1/relayer/universal-profile", {
        lsp6ControllerAddress: [controller], // TODO add upDev controller
        lsp3Profile: values[0]
    }, {
        headers: {
            "Authorization": "Bearer " + process.env.LUKSO_RELAYER_API_KEY,
            "Content-Type": "application/json"
        }
    });
    const parameters = await getDeploymentData(data.transactionHash);

    const lsp23Tx = await lsp23Factory.deployERC1167Proxies(
        parameters[0].value,
        parameters[1].value,
        parameters[2].value,
        parameters[3].value,
    );
    await lsp23Tx.wait();

    const upRegistryTx = await upRegistry.setUP(data.universalProfileAddress, controller);
    await upRegistryTx.wait();

    // TODO mint AccountNFT
    const request = await prepareRequest(
        account.provider,
        account.access_token
    );
    // TODO send tx on behalf of created UP (via KeyManager? use data.keyManagerAddress? use tx.ts?) on Sepolia
    // TODO remove updev controller from Sepolia's UP

    // TODO mintBatch Group Member NFTs
    // TODO send tx on behalf of created UP (via KeyManager? use data.keyManagerAddress? use tx.ts?) on Lukso. btw check Lukso's Gas Relayer
    // TODO remove updev controller from Lukso's UP

    res.status(200).json({
        up: data.universalProfileAddress
    });
}
