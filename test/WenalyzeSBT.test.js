const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WenalyzeSBT", function () {
  let sbt, admin, user;

  beforeEach(async function () {
    [admin, user] = await ethers.getSigners();

    const WenalyzeSBT = await ethers.getContractFactory("WenalyzeSBT");
    sbt = await WenalyzeSBT.deploy(admin.address);
    await sbt.waitForDeployment();

    const MINTER_ROLE = await sbt.MINTER_ROLE();
    await sbt.grantRole(MINTER_ROLE, admin.address);
  });

  it("mints SBT correctly", async function () {
    await sbt.mint(
      user.address,
      50,
      ethers.keccak256("0x1234"),
      ethers.keccak256("0x5678")
    );

    const data = await sbt.sbtData(user.address);
    expect(data.active).to.equal(true);
  });

  it("revokes SBT correctly", async function () {
    await sbt.mint(
      user.address,
      50,
      ethers.keccak256("0x1234"),
      ethers.keccak256("0x5678")
    );

    await sbt.revoke(user.address);

    const data = await sbt.sbtData(user.address);
    expect(data.active).to.equal(false);
  });
});
