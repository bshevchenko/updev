import { expect } from "chai";
import { ethers } from "hardhat";
import { UpDevAccountNFT } from "../typechain-types";
import getSourceCode from "../sources/get";

describe("upDevAccountNFT", () => {
  let nft: UpDevAccountNFT;

  const source = "twitter"; // TODO

  it("Should deploy & add consumer to Chainlink router", async () => {
    const factory = await ethers.getContractFactory("upDevAccountNFT");

    nft = (await factory.deploy(
      process.env.DON_ROUTER,
      process.env.DON_ID,
      process.env.ACCOUNT_NFT_FORCE,
      process.env.DON_GAS_LIMIT,
    )) as UpDevAccountNFT;
    await nft.deployed();

    const router = await ethers.getContractAt("IChainlinkFunctionsRouter", process.env.DON_ROUTER || "");
    const tx = await router.addConsumer(process.env.DON_SUB_ID, nft.address);
    await tx.wait();
  });

  it("Should add source & get available sources", async () => {
    const tx = await nft.addSource(source, getSourceCode(source));
    await tx.wait();
    expect(await nft.getSources()).to.deep.equal([source]);
  });

  it("Shouldn't add source if name is already busy", async () => {
    await expect(nft.addSource(source, "")).to.be.revertedWithCustomError(nft, "SourceNameBusy");
  });

  it("Should send & fulfill request with error", async () => {
    nft.sendRequest(
      // TODO add test source code and use it here (to avoid OAuth flow)
      process.env.DON_SUB_ID || 0, // TODO switch to DON hosted secrets to avoid using GitHub Gist API
      "0x",
      0,
      0,
      source,
      "QmP2Wpt6eCPrRkNjQmfDkvhdbgtC79ATHVz9Q1cBsY5WUR",
      "updevonly",
    );
    const event: Promise<UpDevAccountNFT.RequestStruct> = new Promise(resolve => {
      nft.on("Response", async (id, request) => {
        resolve(request);
      });
    });
    const request = await event;
    expect(request.isFinished).to.equal(true);
    expect(request.isOwned).to.equal(false);
    expect(ethers.utils.toUtf8String(request.data.toString())).to.include("Twitter fail");
  });

  // TODO it should fulfill request – all cases
  // TODO it should mint/claim token

  // TODO it should getRequests
  // TODO it should getPendingRequests

  // TODO should transfer existing token to new address
  // TODO it should not transfer/transferBatch (soulbound)

  // TODO LSP8 Mintable tests?
});
