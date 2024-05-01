import { expect } from "chai";
import { ethers } from "hardhat";
import { UpDevGroupMemberNFT, UpDevGroupNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const _LSP4_GROUP_TOKEN_ID_KEY = "0x47524f55505f544f4b454e5f4944000000000000000000000000000000000000";
const _LSP4_ARCHIVE_KEY = "0x4152434849564500000000000000000000000000000000000000000000000000";
const _LSP4_BAN_KEY = "0x4152434849564500000000000000000000000000000000000000000000000000";

describe("upDevGroupMemberNFT", () => {

    let nft: UpDevGroupMemberNFT;
    let groupNFT: UpDevGroupNFT;
    let signers: SignerWithAddress[];
    let owner: SignerWithAddress;

    let tokenId: string;
    let groupTokenId: string;

    const emptyBytes32 = ethers.utils.formatBytes32String('');

    before(async () => {
        signers = await ethers.getSigners();
        owner = signers[0];
    });

    it("Should deploy", async () => {
        let factory = await ethers.getContractFactory("upDevGroupNFT");
        groupNFT = (await factory.deploy(true)) as UpDevGroupNFT;
        await groupNFT.deployed();

        factory = await ethers.getContractFactory("upDevGroupMemberNFT");
        nft = (await factory.deploy(groupNFT.address, true)) as UpDevGroupMemberNFT;
        await nft.deployed();

        expect(await nft.group()).to.equal(groupNFT.address);
    });

    it("Should mint", async () => {
        await groupNFT.mint("0x01", "0x", emptyBytes32);

        const groupTokenIds = await groupNFT.tokenIdsOf(owner.address);
        groupTokenId = groupTokenIds[0];

        await nft.mint(groupTokenId, []);
        const tokenIds = await nft.tokenIdsOf(owner.address);
        tokenId = tokenIds[0];

        expect(await nft.getDataForTokenId(tokenId, _LSP4_GROUP_TOKEN_ID_KEY)).to.equal(groupTokenId);
    });

    it("Should set archive", async () => {
        await nft.setArchive(tokenId, true);
        expect(await nft.getDataForTokenId(tokenId, _LSP4_ARCHIVE_KEY)).to.equal("0x01");
    });

    it("Should ban", async () => {
        await nft.setBan(tokenId, true);
        expect(await nft.getDataForTokenId(tokenId, _LSP4_BAN_KEY)).to.equal("0x01");
    });

    it("Should ban only if group owner", async () => {
        await expect(nft.connect(signers[1]).setBan(tokenId, true)).to.be.revertedWithCustomError(nft, "NotAllowed");
    });

    it("Should mint batch", async () => {
        await groupNFT.connect(signers[1]).mintBatch(["0x01", "0x01", "0x01"], ["0x", "0x", "0x"], [emptyBytes32, emptyBytes32, emptyBytes32]);
        const groupTokenIds = await groupNFT.tokenIdsOf(signers[1].address);

        await nft.connect(signers[1]).mintBatch(groupTokenIds);
        const tokenIds = await nft.tokenIdsOf(signers[1].address);
        expect(tokenIds.length).to.equal(3);
    });

    // TODO it should not mint if not whitelisted

    // TODO it should ban batch
    // TODO it should archive batch
})