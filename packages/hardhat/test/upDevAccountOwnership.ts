import { expect } from "chai";
import { ethers } from "hardhat";
import { upDevAccountOwnership } from "../typechain-types";

describe("upDevAccountOwnership", () => {
  const tokenId = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "string"], ["github", "bshevchenko"]));
  // const defaultAbiCoder = new ethers.utils.AbiCoder();
  // const data = defaultAbiCoder.encode([ "string", "string" ], [ "github", "bshevchenko" ]);

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

  it("Should mint tmp", async () => {
    await collection.mintTmp(
      owner.address,
      tokenId,
      true, // to mint for EOA
      "github",
      "bshevchenko",
    );
    const data = await collection.getTokenDataForAddress(owner.address);
    expect(data[0].source).to.equal("github");
    expect(data[0].id).to.equal("bshevchenko");
  });

  // it("Should mint", async () => {
  //   await collection.mint(
  //     owner.address,
  //     tokenId,
  //     true, // to mint for EOA
  //     data,
  //   );
  //   const tokensIdsOf = await collection.tokenIdsOf(owner.address);
  //   expect(tokensIdsOf[0]).to.equal(tokenId);

  //   // expect(
  //   //   defaultAbiCoder.decode(
  //   //     ["string", "string"],
  //   //     data
  //   //   )
  //   // ).to.equal([ "github", "bshevchenko" ]);

  //   const _data = await collection.getData(tokenId);
  //   expect(_data).to.equal(data);

  //   expect(defaultAbiCoder.decode(["string", "string"], _data)).to.deep.equal(["github", "bshevchenko"]);
  // });

  it("Should transfer existing token on mint for new address", async () => {
    await collection.mintTmp(
      dude.address,
      tokenId,
      true, // to transfer to EOA
      "github",
      "bshevchenko",
    );
    const tokensIdsOfOwner = await collection.tokenIdsOf(owner.address);
    const tokensIdsOfDude = await collection.tokenIdsOf(dude.address);
    expect(tokensIdsOfOwner.length).to.equal(0);
    expect(tokensIdsOfDude[0]).to.equal(tokenId);
  });

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
