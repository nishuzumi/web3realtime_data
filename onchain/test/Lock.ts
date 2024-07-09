import {expect} from "chai";
import hre, {ethers} from "hardhat";
import {UniswapInfoFetcher} from "../typechain-types";

describe("UniswapInfoFetcher", function () {
  let uniswapInfoFetcher: UniswapInfoFetcher;
  const UNISWAP_V2_PAIR = "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc"; // USDC-WETH pair
  const UNISWAP_V3_POOL = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8"; // USDC-WETH pool

  before(async function () {
    const UniswapInfoFetcher = await ethers.getContractFactory("UniswapInfoFetcher");
    uniswapInfoFetcher = await UniswapInfoFetcher.deploy();
  });

  it("Should get current block info", async function () {
    const [blockNumber, timestamp] = await uniswapInfoFetcher.getBlockInfo();
    expect(blockNumber).to.be.gt(0);
    expect(timestamp).to.be.gt(0);
  });

  it("Should get V2 pair info with correct prices", async function () {
    const pairInfo = await uniswapInfoFetcher.getV2PairInfo(UNISWAP_V2_PAIR);
    console.log(pairInfo)
    expect(pairInfo.name).to.equal("Uniswap V2 USDC-WETH");
    expect(pairInfo.symbol).to.equal("UNI-V2-USDC-WETH");
    expect(pairInfo.token0.symbol).to.equal("USDC");
    expect(pairInfo.token1.symbol).to.equal("WETH");
    expect(pairInfo.reserve0).to.be.gt(0);
    expect(pairInfo.reserve1).to.be.gt(0);

    const priceUsdcPerEth = ethers.formatUnits(pairInfo.prices.price0Per1, pairInfo.token0.decimals);
    const priceEthPerUsdc = ethers.formatUnits(pairInfo.prices.price1Per0, pairInfo.token1.decimals);
    console.log("V2 Price (USDC per WETH):", priceUsdcPerEth);
    console.log("V2 Price (WETH per USDC):", priceEthPerUsdc);

    expect(parseFloat(priceUsdcPerEth)).to.be.gt(100);
    expect(parseFloat(priceUsdcPerEth)).to.be.lt(10000);
    expect(parseFloat(priceEthPerUsdc)).to.be.lt(0.01);
    expect(parseFloat(priceEthPerUsdc)).to.be.gt(0.0001);
  });

  it("Should get V3 pair info with correct prices", async function () {
    const pairInfo = await uniswapInfoFetcher.getV3PairInfo(UNISWAP_V3_POOL);
    expect(pairInfo.name).to.equal("Uniswap V3 USDC-WETH");
    expect(pairInfo.symbol).to.equal("UNI-V3-USDC-WETH");
    expect(pairInfo.token0.symbol).to.equal("USDC");
    expect(pairInfo.token1.symbol).to.equal("WETH");
    expect(pairInfo.sqrtPriceX96).to.be.gt(0);

 const priceUsdcPerEth = ethers.formatUnits(pairInfo.prices.price0Per1, pairInfo.token0.decimals);
    const priceEthPerUsdc = ethers.formatUnits(pairInfo.prices.price1Per0, pairInfo.token1.decimals);
    console.log("V3 Price (USDC per WETH):", priceUsdcPerEth);
    console.log("V3 Price (WETH per USDC):", priceEthPerUsdc);

    expect(parseFloat(priceUsdcPerEth)).to.be.gt(100);
    expect(parseFloat(priceUsdcPerEth)).to.be.lt(10000);
    expect(parseFloat(priceEthPerUsdc)).to.be.lt(0.01);
    expect(parseFloat(priceEthPerUsdc)).to.be.gt(0.0001);
  });
});