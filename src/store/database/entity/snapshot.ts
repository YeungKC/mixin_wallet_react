import { Asset, ExchangeRate, Snapshot, User } from "mixin-node-sdk/dist/types"
import { EntitySchema } from "typeorm"

export interface SnapshotSchema extends Snapshot {
  confirmations?: number
  opponenter?: User
  asset?: Asset
  fiat?: ExchangeRate
}

export const SnaphostEntity = new EntitySchema<SnapshotSchema>({
  name: 'snapshot',
  columns: {
    snapshot_id: { type: String, primary: true },
    type: { type: String },
    trace_id: { type: String },
    user_id: { type: String, nullable: true },
    asset_id: { type: String, nullable: true },
    created_at: { type: String },
    opponent_id: { type: String, nullable: true },
    source: { type: String, nullable: true },
    amount: { type: String },
    memo: { type: String },
    chain_id: { type: String, nullable: true },
    opening_balance: { type: String, nullable: true },
    closing_balance: { type: String, nullable: true },
    sender: { type: String, nullable: true },
    receiver: { type: String, nullable: true },
    transaction_hash: { type: String, nullable: true },
    // asset: { type: Asset, nullable: true}
    data: { type: String, nullable: true },
    // fee

    confirmations: { type: Number, nullable: true },
  },
})
