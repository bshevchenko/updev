import { expect } from "chai";
import { ethers } from "hardhat";

const coder = ethers.utils.defaultAbiCoder;
const te = new TextEncoder();

function uint32(value: any) {
  return value.toString(16).padStart(64, "0");
}

function string(value: any) {
  return (
    (
      value.length.toString(16) +
      Array.from(te.encode(value))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("")
    ).padStart(64 + value.length * 2, "0") + "0".repeat(64 - value.length * 2)
  );
}

describe("Simple ABI Encoder", () => {
  it("Should encode & decode uint32 values", async () => {
    const types = ["uint32", "uint32", "uint32"];
    const values = [432543, 239430000, 2906540];
    const encoded = "0x" + uint32(values[0]) + uint32(values[1]) + uint32(values[2]);
    expect(encoded).to.equal(coder.encode(types, values));
    expect(coder.decode(types, encoded)).to.deep.equal(values);
  });

  it("Should encode & decode uint32 & string values", async () => {
    const types = ["uint32", "uint32", "string", "string"];
    const values = [32, 1, "builder", "cadet"];
    const encoded =
      "0x" +
      uint32(values[0]) +
      uint32(values[1]) +
      "000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0" + // TODO
      string(values[2]) +
      string(values[3]);
    expect(encoded).to.equal(coder.encode(types, values));
    expect(coder.decode(types, encoded)).to.deep.equal(values);
  });
});
