import { expect } from "chai";
import { ethers } from "hardhat";
import { UpDevFunctionsConsumer } from "../typechain-types";
import getSourceCode from "../sources/get";

describe("upDevFunctionsConsumer", () => {
  let consumer: UpDevFunctionsConsumer;
  // let owner: any; TODO ???

  const source = "twitter";

  // before(async () => {
  //     owner = (await ethers.getSigners())[0];
  // });

  it("Should deploy & add consumer to Chainlink router", async () => {
    const factory = await ethers.getContractFactory("upDevFunctionsConsumer");
    const collectionAddress = "0x0000000000000000000000000000000000000000"; // TODO tmp

    consumer = (await factory.deploy(
      process.env.DON_ROUTER,
      process.env.DON_ID,
      collectionAddress,
    )) as UpDevFunctionsConsumer;
    await consumer.deployed();

    expect(await consumer.collection()).to.equal(collectionAddress);

    const router = await ethers.getContractAt("IChainlinkFunctionsRouter", process.env.DON_ROUTER || "");
    const tx = await router.addConsumer(process.env.DON_SUB_ID, consumer.address);
    await tx.wait();
  });

  it("Should add source & get available sources", async () => {
    const tx = await consumer.addSource(source, getSourceCode(source));
    await tx.wait();
    expect(await consumer.getAvailableSources()).to.deep.equal([source]);
  });

  it("Shouldn't add source if name is already busy", async () => {
    await expect(consumer.addSource(source, "")).to.be.revertedWithCustomError(consumer, "SourceNameBusy");
  });

  it("Should send & fulfill request with error", async () => {
    consumer.sendRequest(
      // TODO add test source code and use it here (to avoid OAuth flow)
      process.env.DON_SUB_ID || 0, // TODO switch to DON hosted secrets to avoid using GitHub Gist API
      "0x",
      0,
      0,
      source,
      "QmP2Wpt6eCPrRkNjQmfDkvhdbgtC79ATHVz9Q1cBsY5WUR",
      "updevonly",
    );
    const event: Promise<UpDevFunctionsConsumer.RequestStruct> = new Promise(resolve => {
      consumer.on("Response", async (id, request) => {
        resolve(request);
      });
    });
    const request = await event;
    expect(request.isFinished).to.equal(true);
    expect(request.isOwned).to.equal(false);
    expect(ethers.utils.toUtf8String(request.data.toString())).to.include("Twitter fail");
  });

  // TODO it should fulfill request, including errors
  // TODO it should mint/claim token
});
