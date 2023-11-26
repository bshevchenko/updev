import { expect } from "chai";
import { ethers } from "hardhat";
import { upDevAccountOwnership } from "../typechain-types";

describe("upDevAccountOwnership", () => {
  const tokenId = "0x2350000000000000000000000000000000000000000000000000000000000000";

  let collection: upDevAccountOwnership;
  let owner: any;
  let dude: any;
  before(async () => {
    owner = (await ethers.getSigners())[0];
    dude = (await ethers.getSigners())[1];
    const factory = await ethers.getContractFactory("upDevAccountOwnership");
    collection = (await factory.deploy("Account Ownership", "UPDEV", owner.address)) as upDevAccountOwnership;
    await collection.deployed();
  });

  it("Should mint", async () => {
    await collection.mint(
      owner.address,
      tokenId,
      true, // to mint for EOA
      "0x",
    );
    const tokensIdsOf = await collection.tokenIdsOf(owner.address);
    expect(tokensIdsOf[0]).to.equal(tokenId);
  });

  it("Should transfer existing token on mint for new address", async () => {
    await collection.mint(
      dude.address,
      tokenId,
      true, // to transfer to EOA
      "0x",
    );
    const tokensIdsOfOwner = await collection.tokenIdsOf(owner.address);
    const tokensIdsOfDude = await collection.tokenIdsOf(dude.address);
    expect(tokensIdsOfOwner.length).to.equal(0);
    expect(tokensIdsOfDude[0]).to.equal(tokenId);
  });

  // TODO on mint –it should transfer already minted tokens

  it("Should not transfer (soulbound)", async () => {
    try {
      await collection.transfer(owner.address, owner.address, tokenId, false, "0x");
    } catch (e: any) {
      expect(e.message).to.include("Soulbound");
      return;
    }
    expect(true).to.equal(false);
  });

  it("Should not transferBatch (soulbound)", async () => {
    try {
      await collection.transferBatch([owner.address], [owner.address], [tokenId], [false], ["0x"]);
    } catch (e: any) {
      expect(e.message).to.include("Soulbound");
      return;
    }
    expect(true).to.equal(false);
  });
});
