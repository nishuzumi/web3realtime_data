// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20Minimal {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);
}

interface IUniswapV2PairMinimal {
    function token0() external view returns (address);

    function token1() external view returns (address);

    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);
}

interface IUniswapV3PoolMinimal {
    function token0() external view returns (address);

    function token1() external view returns (address);

    function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked);
}

contract UniswapInfoFetcher {
    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        uint8 decimals;
    }

    struct PriceInfo {
        uint256 price0Per1;  // Price of token1 in terms of token0 (e.g., USDC per WETH)
        uint256 price1Per0;  // Price of token0 in terms of token1 (e.g., WETH per USDC)
    }

    struct PairInfo {
        string name;
        string symbol;
        TokenInfo token0;
        TokenInfo token1;
        uint256 reserve0;
        uint256 reserve1;
        PriceInfo prices;
    }

    struct V3PairInfo {
        string name;
        string symbol;
        TokenInfo token0;
        TokenInfo token1;
        uint160 sqrtPriceX96;
        int24 tick;
        PriceInfo prices;
    }

    function getBlockInfo() public view returns (uint256 blockNumber, uint256 timestamp) {
        blockNumber = block.number;
        timestamp = block.timestamp;
    }

    function getV2PairInfo(address pairAddress) public view returns (PairInfo memory) {
        IUniswapV2PairMinimal pair = IUniswapV2PairMinimal(pairAddress);
        address token0 = pair.token0();
        address token1 = pair.token1();
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();

        TokenInfo memory tokenInfo0 = getTokenInfo(token0);
        TokenInfo memory tokenInfo1 = getTokenInfo(token1);

        PriceInfo memory prices = calculateV2Prices(reserve0, reserve1, tokenInfo0.decimals, tokenInfo1.decimals);

        string memory name = string(abi.encodePacked("Uniswap V2 ", tokenInfo0.symbol, "-", tokenInfo1.symbol));
        string memory symbol = string(abi.encodePacked("UNI-V2-", tokenInfo0.symbol, "-", tokenInfo1.symbol));
        return PairInfo({
            name: name,
            symbol: symbol,
            token0: tokenInfo0,
            token1: tokenInfo1,
            reserve0: reserve0,
            reserve1: reserve1,
            prices: prices
        });
    }

    function getV3PairInfo(address poolAddress) public view returns (V3PairInfo memory) {
        IUniswapV3PoolMinimal pool = IUniswapV3PoolMinimal(poolAddress);
        address token0 = pool.token0();
        address token1 = pool.token1();
        (uint160 sqrtPriceX96, int24 tick,,,,,) = pool.slot0();

        TokenInfo memory tokenInfo0 = getTokenInfo(token0);
        TokenInfo memory tokenInfo1 = getTokenInfo(token1);

        PriceInfo memory prices = calculateV3Prices(sqrtPriceX96, tokenInfo0.decimals, tokenInfo1.decimals);

        string memory name = string(abi.encodePacked("Uniswap V3 ", tokenInfo0.symbol, "-", tokenInfo1.symbol));
        string memory symbol = string(abi.encodePacked("UNI-V3-", tokenInfo0.symbol, "-", tokenInfo1.symbol));

        return V3PairInfo({
            name: name,
            symbol: symbol,
            token0: tokenInfo0,
            token1: tokenInfo1,
            sqrtPriceX96: sqrtPriceX96,
            tick: tick,
            prices: prices
        });
    }

    function getTokenInfo(address tokenAddress) private view returns (TokenInfo memory) {
        IERC20Minimal token = IERC20Minimal(tokenAddress);
        return TokenInfo({
            tokenAddress: tokenAddress,
            name: token.name(),
            symbol: token.symbol(),
            decimals: token.decimals()
        });
    }

    function calculateV2Prices(uint256 reserve0, uint256 reserve1, uint8 decimals0, uint8 decimals1) public pure returns (PriceInfo memory) {
        if (reserve0 == 0 || reserve1 == 0) return PriceInfo(0, 0);

        uint256 price0Per1 = (reserve0 * (10 ** decimals1)) / reserve1;  // e.g., USDC per WETH
        uint256 price1Per0 = (reserve1 * (10 ** decimals0)) / reserve0;  // e.g., WETH per USDC

        return PriceInfo(price0Per1, price1Per0);
    }

    function calculateV3Prices(uint160 sqrtPriceX96, uint8 decimals0, uint8 decimals1) public pure returns (PriceInfo memory) {
        uint256 price1Per0 = uint256(sqrtPriceX96) * uint256(sqrtPriceX96) * (10 ** decimals0) / (2 ** 192);
        uint256 price0Per1;

        if (price1Per0 > 0) {
            price0Per1 = (10 ** decimals1) * (2 ** 192) / (uint256(sqrtPriceX96) * uint256(sqrtPriceX96));
        } else {
            price0Per1 = 0;
        }

        return PriceInfo(price0Per1, price1Per0);
    }
}
