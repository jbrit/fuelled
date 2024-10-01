import {
  MemeFactory,
} from "generated";

MemeFactory.PoolInitialized.handler(async ({ event, context }) => {
  context.Pool.set({
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    //@ts-ignore
    name: event.params.name,
    //@ts-ignore
    symbol: event.params.symbol,
    //@ts-ignore
    description: event.params.description,
    //@ts-ignore
    image: event.params.image,
    //@ts-ignore
    twitter: event.params.twitter,
    //@ts-ignore
    telegram: event.params.telegram,
    //@ts-ignore
    website: event.params.website,
    asset: event.params.asset_id.bits,
    contract: event.params.contract_id.bits,
    createdBy: event.params.dev.payload.bits,
    createdAt: event.block.time,
    txId: event.transaction.id,
  })
});


MemeFactory.TokenSold.handler(async ({ event, context }) => {
  context.Trade.set({
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    tradeType: "SELL",
    token: event.params.asset_id.bits,
    tokenAmount: event.params.amount,
    ethAmount: event.params.eth_out,
    trader: event.params.trader.payload.bits,
    createdAt: event.block.time,
    txId: event.transaction.id,
  })
});


MemeFactory.TokenBought.handler(async ({ event, context }) => {
  context.Trade.set({
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    tradeType: "BUY",
    token: event.params.asset_id.bits,
    tokenAmount: event.params.amount,
    ethAmount: event.params.eth_in,
    trader: event.params.trader.payload.bits,
    createdAt: event.block.time,
    txId: event.transaction.id,
  })
});

