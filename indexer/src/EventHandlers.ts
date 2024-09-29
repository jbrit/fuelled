import {
  MemeFactory,
} from "generated";

MemeFactory.PoolInitialized.handler(async ({ event, context }) => {
  context.Pool.set({
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    name: event.params.name,
    symbol: event.params.symbol,
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
    tokenAmount: event.params.amount,
    ethAmount: event.params.eth_in,
    trader: event.params.trader.payload.bits,
    createdAt: event.block.time,
    txId: event.transaction.id,
  })
});

