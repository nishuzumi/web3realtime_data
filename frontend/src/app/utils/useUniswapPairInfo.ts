import { useQuery } from '@tanstack/react-query';

// 定义返回数据的类型
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface PriceInfo {
  price0Per1: string;
  price1Per0: string;
}

export interface BlockInfo {
  blockNumber: number;
  timestamp: number;
}

export interface V2PairInfo {
  name: string;
  symbol: string;
  token0: TokenInfo;
  token1: TokenInfo;
  reserve0: string;
  reserve1: string;
  prices: PriceInfo;
}

export interface V3PairInfo {
  name: string;
  symbol: string;
  token0: TokenInfo;
  token1: TokenInfo;
  sqrtPriceX96: string;
  tick: number;
  prices: PriceInfo;
}

// 创建函数来解析返回的数据
function parseV2PairInfo(data: any[]): V2PairInfo {
  const [name, symbol, token0, token1, reserve0, reserve1, prices] = data[0];
  return {
    name,
    symbol,
    token0: {
      address: token0[0],
      name: token0[1],
      symbol: token0[2],
      decimals: parseInt(token0[3]) 
    },
    token1: {
      address: token1[0],
      name: token1[1],
      symbol: token1[2],
      decimals: parseInt(token1[3]) 
    },
    reserve0,
    reserve1,
    prices: {
      price0Per1: prices[0],
      price1Per0: prices[1]
    }
  };
}

function parseV3PairInfo(data: any[]): V3PairInfo {
  const [name, symbol, token0, token1, sqrtPriceX96, tick, prices] = data[0];
  return {
    name,
    symbol,
    token0: {
      address: token0[0],
      name: token0[1],
      symbol: token0[2],
      decimals: parseInt(token0[3]) 
    },
    token1: {
      address: token1[0],
      name: token1[1],
      symbol: token1[2],
      decimals: parseInt(token1[3]) 
    },
    sqrtPriceX96,
    tick,
    prices: {
      price0Per1: prices[0],
      price1Per0: prices[1]
    }
  };
}

function parseBlockInfo(data: any[]): BlockInfo {
  const [blockNumber, timestamp] = data;
  return {
    blockNumber:parseInt(blockNumber),
    timestamp:parseInt(timestamp)
  };
}

export function useUniSwapV2PairInfo(pairAddress: string, blockNumber: number) {
  const baseUrl = 'https://0x34c4a269ebab233983e6e11ee70a0387b417cda4.w3eth.io';
  const url = `${baseUrl}/getV2PairInfo/${pairAddress}?returns=((string,string,(address,string,string,uint8),(address,string,string,uint8),uint256,uint256,(uint256,uint256)))`;

  return useQuery({
    queryKey: ['uniswapV2PairInfo', pairAddress, blockNumber],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return parseV2PairInfo(data);
    },
  });
}

export function useUniSwapV3PairInfo(poolAddress: string, blockNumber: number) {
  const baseUrl = 'https://0x34c4a269ebab233983e6e11ee70a0387b417cda4.w3eth.io';
  const url = `${baseUrl}/getV3PairInfo/${poolAddress}?returns=((string,string,(address,string,string,uint8),(address,string,string,uint8),uint160,int24,(uint256,uint256)))`;

  return useQuery({
    queryKey: ['uniswapV3PairInfo', poolAddress, blockNumber],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return parseV3PairInfo(data);
    },
  });
}

export function useBlockInfo() {
  const baseUrl = 'https://0x34c4a269ebab233983e6e11ee70a0387b417cda4.w3eth.io';
  const url = `${baseUrl}/getBlockInfo?returns=(uint256,uint256)`;

  return useQuery({
    queryKey: ['blockInfo'],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return parseBlockInfo(data);
    },
    refetchInterval: 15000, // 每15秒刷新一次
  });
}
