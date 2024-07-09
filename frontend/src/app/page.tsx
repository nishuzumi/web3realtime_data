'use client'

import {useBlockInfo} from "@/app/utils/useUniswapPairInfo";
import {Button, Card, Divider, Progress, Select, SelectItem} from "@nextui-org/react";
import {CardBody} from "@nextui-org/card";
import PricePanel from "@/app/components/PricePanel";
import FormattedTimestamp from "@/app/components/FormattedTimestamp";
import {useCallback, useState} from "react";
import {formatUnits} from "ethers";
import {Input} from "@nextui-org/input";

type Pair = { type: 'v2' | 'v3', address: string }

export default function Home() {
  const {data, isLoading} = useBlockInfo();
  const [address, setAddress] = useState("")
  const [type, setType] = useState<'v2' | 'v3'>('v2')
  const [list, setList] = useState<Array<Pair>>([])

  const onAdd = () => {
    setList((list) => {
      const v = [...list]
      v.push({
        type,
        address
      })

      return [...new Set(v)]
    })
  }

  return (
    <main className="min-h-screen justify-center items-center flex ">
      <div className="container mx-auto flex flex-col items-center">
        <Card className="m-8 justify-center">
          <CardBody>
            <div className="flex items-center space-x-4 text-small">
              <div className="flex flex-col h-full items-center">
                <div className="text-4xl font-bold text-center">Realtime Token Price</div>
                <div className="mt-1 text-xl">Made by <a className="text-blue-500" href="https://x.com/BoxMrChen"
                                                         target="_blank">@BoxMrChen</a></div>

                {isLoading ? (
                  <CardBody>Loading...</CardBody>
                ) : (
                  <div>
                    <div className="text-xl mt-2">Current Ethereum Block: {data?.blockNumber}, {data?.timestamp &&
                      <FormattedTimestamp timestamp={data.timestamp}/>}</div>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <div className={"flex gap-3 items-center mb-8"}>
          <Input size={"sm"} type="email" label="Pair Address" className="min-w-96"
                 onChange={(e) => setAddress(e.target.value)}
                 value={address}
          />
          <Select
            label="Select a pair type"
            className="min-w-[148px]"
            size="sm"
            onChange={(e) => setType(e.target.value as any)}
            value={type}
          >
            <SelectItem key={"v2"}>
              Uniswap V2
            </SelectItem>
            <SelectItem key={"v3"}>
              Uniswap V3
            </SelectItem>
          </Select>
          <Button color="primary" onClick={onAdd}>Add Pair</Button>
        </div>

        <div className="flex flex-wrap gap-4 w-full justify-center">
          <PricePanel address={"0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc"} blockNumber={data?.blockNumber}
                      version={"v2"} eth={true}
          />
          <PricePanel address={"0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8"} blockNumber={data?.blockNumber}
                      version={"v3"}/>
          <PricePanel address={"0x9Db9e0e53058C89e5B94e29621a205198648425B"} blockNumber={data?.blockNumber}
                      version={"v3"}/>
          <PricePanel address={"0xc3Db44ADC1fCdFd5671f555236eae49f4A8EEa18"} blockNumber={data?.blockNumber}
                      version={"v3"}/>
          {list.map((l) => (
            <PricePanel key={l.address} address={l.address} version={l.type} blockNumber={data?.blockNumber}/>
          ))}
        </div>
      </div>
    </main>
  );
}
