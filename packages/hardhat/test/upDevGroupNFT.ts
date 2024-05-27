import { expect } from "chai";
import { ethers } from "hardhat";
import { UpDevGroupNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const _LSP4_WHITELIST_KEY = "0x57484954454c4953540000000000000000000000000000000000000000000000";
const _LSP4_METADATA_KEY = "0x4d45544144415441000000000000000000000000000000000000000000000000";
const _LSP4_PARENT_KEY = "0x504152454e540000000000000000000000000000000000000000000000000000";
const _LSP4_ARCHIVE_KEY = "0x4152434849564500000000000000000000000000000000000000000000000000";

describe("upDevGroupNFT", () => {

    let nft: UpDevGroupNFT;
    let signers: SignerWithAddress[];
    let owner: SignerWithAddress;

    let tokenId: string;

    const emptyBytes32 = ethers.utils.formatBytes32String('');

    before(async () => {
        signers = await ethers.getSigners();
        owner = signers[0];
    });

    it("Should deploy", async () => {
        let factory = await ethers.getContractFactory("upDevGroupNFT");
        nft = (await factory.deploy(true)) as UpDevGroupNFT;
        await nft.deployed();
    });

    it("Should mint", async () => {
        await nft.mint("0x01", "0x02", emptyBytes32);

        const tokenIds = await nft.tokenIdsOf(owner.address);
        expect(tokenIds.length).to.equal(1);

        tokenId = tokenIds[0];

        const [whitelist, metadata, parent] = await nft.getDataBatchForTokenIds(
            new Array(3).fill(tokenId),
            [
                _LSP4_WHITELIST_KEY,
                _LSP4_METADATA_KEY,
                _LSP4_PARENT_KEY,
            ],
        );

        expect(metadata).to.equal("0x01");
        expect(whitelist).to.equal("0x02");
        expect(parent).to.equal(emptyBytes32);
    });

    it("Should mint with parentTokenId", async () => {
        await nft.mint("0x01", "0x02", tokenId);

        const tokenIds = await nft.tokenIdsOf(owner.address);
        expect(tokenIds.length).to.equal(2);

        const parent = await nft.getDataForTokenId(tokenIds[1], _LSP4_PARENT_KEY);
        expect(parent).to.equal(tokenId);
    });

    it("Should only mint with parentTokenId if user is admin", async () => {
        await expect(
            nft.connect(signers[1]).mint("0x01", "0x02", tokenId)
        ).to.be.revertedWithCustomError(nft, "NotAllowed")
    });

    it("Should set", async () => {
        await nft.setWhitelist(tokenId, "0x04");
        await nft.setMetadata(tokenId, "0x03");
        await nft.setArchive(tokenId, true);

        const [whitelist, metadata, archive] = await nft.getDataBatchForTokenIds(
            new Array(3).fill(tokenId),
            [
                _LSP4_WHITELIST_KEY,
                _LSP4_METADATA_KEY,
                _LSP4_ARCHIVE_KEY,
            ],
        );

        expect(whitelist).to.equal("0x04");
        expect(metadata).to.equal("0x03");
        expect(archive).to.equal("0x01");
    });

    it("Should mint batch", async () => {
        await nft.mintBatch(["0x05", "0x06", "0x07"], ["0x", "0x", "0x"], [emptyBytes32, emptyBytes32, emptyBytes32]);
        const tokenIds = await nft.tokenIdsOf(owner.address);
        expect(tokenIds.length).to.equal(5);
    });

    it("Should only mint batch with parentTokenIds if user is admin", async () => {
        await expect(
            nft.connect(signers[1]).mintBatch(["0x05", "0x06", "0x07"], ["0x", "0x", "0x"], [tokenId, tokenId, tokenId])
        ).to.be.revertedWithCustomError(nft, "NotAllowed");
    });

    // TODO it should whitelist
})