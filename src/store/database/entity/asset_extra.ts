import { EntitySchema } from "typeorm";

export interface AssetExtra {
    asset_id: string,
    hidden: boolean
}

export const AssetExtraEntity = new EntitySchema<AssetExtra>({
  name: 'asset_extra',
  columns: {
    asset_id: { type: String, primary: true },
    hidden: { type: Boolean, default: false },
  },
})