import { ethers } from "ethers";
import LSP23Factory from "@lukso/lsp-smart-contracts/artifacts/LSP23LinkedContractsFactory.json";
import KeyManager from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
import deployedContracts from "~~/contracts/deployedContracts";
import { signer } from "~~/lib/defender";

const chainId: string = process.env.CHAIN_ID || "";

export const isEmptyAddress = (address: string) => address === "0x0000000000000000000000000000000000000000";

export const upRegistry = new ethers.Contract(
    (deployedContracts as any)[chainId].upRegistry.address,
    (deployedContracts as any)[chainId].upRegistry.abi,
    signer
);

export const lsp23Factory = new ethers.Contract(
    "0x2300000a84d25df63081feaa37ba6b62c4c89a30",
    LSP23Factory.abi,
    signer
);

export const keyManager = (address: string) => {
    return new ethers.Contract(
        address,
        KeyManager.abi,
        signer
    );
}
