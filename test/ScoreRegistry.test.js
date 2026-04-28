const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ScoreRegistry", function () {
  async function deployFixture(validProof = true) {
    const [admin, user] = await ethers.getSigners();

    const MockVerifier = await ethers.getContractFactory("MockVerifier");
    const verifier = await MockVerifier.deploy(validProof);
    await verifier.waitForDeployment();

    const ScoreRegistry = await ethers.getContractFactory("ScoreRegistry");
    const registry = await ScoreRegistry.deploy(
      await verifier.getAddress(),
      admin.address
    );
    await registry.waitForDeployment();

    const a = [1, 2];
    const b = [
      [3, 4],
      [5, 6]
    ];
    const c = [7, 8];

    const input = [
      50,
      111,
      222,
      333,
      444,
      1500,
      42,
      999
    ];

    return { registry, verifier, admin, user, a, b, c, input };
  }

  it("verifies a valid proof and emits event", async function () {
    const { registry, user, a, b, c, input } = await deployFixture(true);

    await expect(
      registry.connect(user).verifyScore(a, b, c, input)
    ).to.emit(registry, "ScoreVerified");
  });

  it("reverts if proof is invalid", async function () {
    const { registry, user, a, b, c, input } = await deployFixture(false);

    await expect(
      registry.connect(user).verifyScore(a, b, c, input)
    ).to.be.revertedWithCustomError(registry, "InvalidProof");
  });

  it("reverts if nullifier is reused", async function () {
    const { registry, user, a, b, c, input } = await deployFixture(true);

    await registry.connect(user).verifyScore(a, b, c, input);

    await expect(
      registry.connect(user).verifyScore(a, b, c, input)
    ).to.be.revertedWithCustomError(registry, "NullifierAlreadyUsed");
  });

  it("can be paused and unpaused by admin", async function () {
    const { registry, user, a, b, c, input } = await deployFixture(true);

    await registry.pause();

    await expect(
      registry.connect(user).verifyScore(a, b, c, input)
    ).to.be.reverted;

    await registry.unpause();

    await expect(
      registry.connect(user).verifyScore(a, b, c, input)
    ).to.emit(registry, "ScoreVerified");
  });

  it("reverts when nullifier reused by different user", async function () {
    const { registry, a, b, c, input } = await deployFixture(true);

    const [_, user1, user2] = await ethers.getSigners();

    await registry.connect(user1).verifyScore(a, b, c, input);

    await expect(
      registry.connect(user2).verifyScore(a, b, c, input)
    ).to.be.revertedWithCustomError(registry, "NullifierAlreadyUsed");
  });
});