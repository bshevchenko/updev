import { expect } from "chai";
import { ethers } from "hardhat";
import { UpDevFunctionsConsumer } from "../typechain-types";
import getSourceCode from "../sources/get";

describe("upDevFunctionsConsumer", () => {
  let consumer: UpDevFunctionsConsumer;
  // let owner: any; TODO

  const source = "twitter";

  // before(async () => {
  //     owner = (await ethers.getSigners())[0];
  // });

  it("Should deploy", async () => {
    const factory = await ethers.getContractFactory("upDevFunctionsConsumer");
    const collectionAddress = "0x0000000000000000000000000000000000000000"; // TODO tmp

    consumer = (await factory.deploy(
      process.env.DON_ROUTER,
      process.env.DON_ID,
      collectionAddress,
    )) as UpDevFunctionsConsumer;
    await consumer.deployed();

    expect(await consumer.collection()).to.equal(collectionAddress);
  });

  it("Should add source & get available sources", async () => {
    await consumer.addSource(source, getSourceCode(source));
    expect(await consumer.getAvailableSources()).to.deep.equal([source]);
  });

  it("Shouldn't add source if name is already busy", async () => {
    await expect(consumer.addSource(source, "")).to.be.revertedWithCustomError(consumer, "SourceNameBusy");
  });

  // TODO it should send request. yarn test --network TESTNET
  // TODO it should fulfill request
  // TODO it should mint/claim token
});
