import { Asset, ExchangeRate } from "mixin-node-sdk/dist/types/asset"
import { EntitySchema } from "typeorm"
import { AssetExtra } from "./asset_extra"

export interface AssetSchema extends Asset {
  chain?: Asset
  extra?: AssetExtra
  fiat?: ExchangeRate
}

export const AssetEntity = new EntitySchema<AssetSchema>({
  name: "asset",
  columns: {
    asset_id: { type: String, primary: true },
    chain_id: { type: String },
    asset_key: { type: String, nullable: true },
    mixin_id: { type: String, nullable: true },
    symbol: { type: String },
    name: { type: String },
    icon_url: { type: String },
    price_btc: { type: String },
    change_btc: { type: String },
    price_usd: { type: String },
    change_usd: { type: String },
    balance: { type: String },
    destination: { type: String },
    tag: { type: String },
    confirmations: { type: Number },
    capitalization: { type: Number, nullable: true },
    amount: { type: String, nullable: true },
    fee: { type: String, nullable: true },
    liquidity: { type: String, nullable: true },
    snapshots_count: { type: Number, nullable: true },
  },
})
