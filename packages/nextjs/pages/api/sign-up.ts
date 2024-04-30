import type { NextApiRequest, NextApiResponse } from "next"
import axios from "axios";
import { ethers } from "ethers";
import { hashMessage } from "@ethersproject/hash";
import ERC725 from "@erc725/erc725.js";
import LSP3Schema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import pinata from "~~/lib/pinata";
import { getDeploymentData } from "~~/lib/up";
import { upRegistry, lsp23Factory, isEmptyAddress } from "~~/lib/contracts";
import { sessions, users } from "~~/lib/db";

const erc725 = new ERC725(LSP3Schema);

type ResponseData = {
    up: string
}

export default async function SignUp(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const sessionToken = req.cookies["__Secure-next-auth.session-token"] || "";
    const session = await sessions.findOne({ sessionToken });
    if (!session || (new Date() > new Date(session.expires))) {
        throw new Error("invalid session");
    }

    const { controller, signature, token, name, description } = req.body;

    if (token !== sessionToken) {
        throw new Error("invalid session token");
    }
    if (ethers.utils.recoverAddress(hashMessage(sessionToken), signature) !== controller) {
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

    const user = await users.findOne(session.userId);
    if (!user) {
        throw new Error("invalid user");
    }

    const json = {
        LSP3Profile: {
            name,
            description,
            tags: ["foot", "samKerr"], // TODO use Group NFT instead?
            profileImage: [
                {
                    // width: 1024, // TODO remove?
                    // height: 1024,
                    url: user.image,
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
    const { data } = await axios.post(process.env.LUKSO_RELAYER_API_URL + "/v1/relayer/universal-profile", {
        lsp6ControllerAddress: [controller],
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

    res.status(200).json({
        up: data.universalProfileAddress
    });
}
