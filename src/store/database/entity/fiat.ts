import { ExchangeRate } from "mixin-node-sdk/dist/types/asset"
import { EntitySchema } from "typeorm"

export const FiatEntity = new EntitySchema<ExchangeRate>({
  name: "fiat",
  columns: {
    code: { type: String, primary: true },
    rate: { type: "decimal" },
  },
})
