import { Address } from "mixin-node-sdk"
import { EntitySchema } from "typeorm"

export const AddressEntity = new EntitySchema<Address>({
  name: "address",
  columns: {
    type: { type: String, nullable: true },
    address_id: { type: String, primary: true },
    asset_id: { type: String },
    destination: { type: String },
    tag: { type: String },
    label: { type: String },
    fee: { type: String },
    dust: { type: String },
  },
})
