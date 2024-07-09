import React, {memo, useEffect, useState} from 'react';
import {Badge, Card, Image} from '@nextui-org/react';
import {SparklinesLine, SparklinesSpots, Sparklines, SparklinesCurve} from "react-sparklines"
import {CardBody, CardHeader} from "@nextui-org/card";
import {
  TokenInfo,
  useUniSwapV2PairInfo,
  useUniSwapV3PairInfo,
  V2PairInfo,
  V3PairInfo
} from "@/app/utils/useUniswapPairInfo";
import {ethers} from "ethers";
import {IconDown, IconUp} from "@/app/icons";
import {atom, useAtom} from 'jotai'

const ethAtom = atom(3000)

interface PriceDisplayProps {
  address: string;
  blockNumber?: number;
  version: 'v2' | 'v3';
  eth?: boolean,
}

type PairInfo = V2PairInfo | V3PairInfo;
type PriceRecord = { [key: number]: PairInfo };

const transformData = (data: PriceRecord, ethPrice: number): number[] => {
  const priceEntries = Object.entries(data);
  priceEntries.sort(([a], [b]) => parseInt(b) - parseInt(a));
  const latestEntries = priceEntries.slice(0, 60);
  if (latestEntries.length === 0) return []
  latestEntries.reverse()

  const [symbol0, symbol1] = [latestEntries[0][1].token0.symbol, latestEntries[0][1].token1.symbol]
  let isETHPair = false
  if (!symbol1.startsWith("USD") && !symbol0.startsWith("USD")) {
    isETHPair = true
  }

  const token0IsUOrE = symbol0.startsWith("USD") || symbol0 == "WETH";

  const entities = latestEntries.map(([_, price]) => {
    const price0 = ethers.formatUnits(price.prices.price0Per1, price.token0.decimals);
    const price1 = ethers.formatUnits(price.prices.price1Per0, price.token1.decimals);

    const t = parseFloat(token0IsUOrE ? price0 : price1);
    return isETHPair ? t * ethPrice : t;
  })

  entities.unshift(entities[0])

  return entities
};

const PricePanel: React.FC<PriceDisplayProps> = memo(function PricePanel({
                                                                           address,
                                                                           blockNumber,
                                                                           version,
                                                                           eth,
                                                                         }) {
  blockNumber ??= 0;
  const hook = version === 'v2' ? useUniSwapV2PairInfo : useUniSwapV3PairInfo;
  const {data, isLoading, isError} = hook(address, blockNumber);
  const [priceRecords, setPriceRecords] = useState({} as PriceRecord)
  const [dataFirst, setDataFirst] = useState<PairInfo | undefined>(undefined)
  const [ethPrice, setEthPrice] = useAtom(ethAtom)

  useEffect(() => {
    if (data !== undefined && priceRecords[blockNumber] === undefined) {
      setPriceRecords({...priceRecords, [blockNumber]: data})

      if (eth) {
        const token0IsU = data.token0.symbol.startsWith("USD");

        const price0 = ethers.formatUnits(data.prices.price0Per1, data.token0.decimals);
        const price1 = ethers.formatUnits(data.prices.price1Per0, data.token1.decimals);

        setEthPrice(parseFloat(token0IsU ? price0 : price1))
      }
    }

    if (data !== undefined && dataFirst === undefined) {
      setDataFirst(data)
    }
  }, [data, blockNumber]);

  let baseToken: TokenInfo | undefined;
  if (dataFirst?.token0.symbol.startsWith("USD")) {
    baseToken = dataFirst?.token1
  } else if (dataFirst?.token0.symbol.startsWith("WETH")) {
    baseToken = dataFirst?.token1
  } else {
    baseToken = dataFirst?.token0
  }

  return (
    <div className="flex-1 [&>*]:w-full min-w-80 max-w-96">
      <Badge content={version} color="danger" placement="top-right" className="top-0 right-0">
        <Card className="w-full flex-1">
          {isLoading && Object.values(priceRecords).length == 0 ? (
            <CardHeader>Loading...</CardHeader>
          ) : isError ? (
            <CardHeader>Failed to load data</CardHeader>
          ) : dataFirst !== undefined ? (
            <>
              <CardHeader className="text-xl block">
                <div className={'flex gap-2 items-center'}>
                  <Image width={32}
                         src={`https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/${baseToken?.address}/logo.png`}/>
                  <span className="text-3xl font-bold">{baseToken?.symbol}</span>
                  <div className="ml-4 text-gray-400 text-sm float-right">{dataFirst.name}</div>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <InnerPricePanel data={transformData(priceRecords, ethPrice)}/>
              </CardBody>
            </>
          ) : "Unknown error"}
        </Card>
      </Badge>

    </div>
  )
});

const InnerPricePanel: React.FC<{ data: number[] }> = ({data}) => {
  const up = data[data.length - 1] >= data[0];
  const currentColor = up ? "green" : 'red'
  const bgColor = `to-[${currentColor}]`;
  const percentChange = ((data[data.length - 1] - data[0]) / data[0]) * 100;
  const priceOffset = Math.abs(data[data.length - 1] - data[0]);
  const localeOption = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }
  return (
    <div className="relative overflow-hidden">
      <Sparklines data={data} width={340} height={80} style={{margin: "2px -2px"}}>
        <SparklinesCurve color={currentColor} style={{fill: currentColor}}/>
      </Sparklines>
      <div className={`h-24 bg-gradient-to-t from-transparent ${bgColor}`}
           style={{
             opacity: 0.1,
             marginTop: "-4px",
             background: `linear-gradient(to top, rgba(0,0,0,0), ${currentColor})`
           }}></div>
      <div className="h-8"></div>
      <div className="absolute ml-2 bottom-2 left-4">
        <div className="font-bold text-2xl">${data[data.length - 1].toLocaleString('en-US', localeOption)}</div>
        <div className={"flex justify-start items-center " + (percentChange >= 0 ? "text-green-500" : "text-red-500")}>
          {percentChange >= 0 ? (
            <><IconUp width={16} style={{marginTop: "4px"}}/>
              <span
                className={"ml-1 text-sm"}>${priceOffset.toLocaleString("en-US", localeOption)}({percentChange.toFixed(2)}%)</span>
            </>
          ) : (
            <><IconDown width={16} style={{marginBottom: "4px"}}/>
              <span
                className={"ml-1 text-sm"}>${priceOffset.toLocaleString("en-US", localeOption)}({Math.abs(percentChange).toFixed(2)}%)</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PricePanel;
