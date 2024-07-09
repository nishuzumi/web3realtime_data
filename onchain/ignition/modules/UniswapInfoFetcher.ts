import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PriceFetcherModule = buildModule("PriceFetcherModule", (m) => {
  const priceFetcher = m.contract("UniswapInfoFetcher");

  return { lock: priceFetcher };
});

export default PriceFetcherModule;
