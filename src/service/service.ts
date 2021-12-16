import { Client } from "mixin-node-sdk"
import { User } from "mixin-node-sdk/dist/types"
import { QueryClient } from "react-query"
import { getRecoil, setRecoil } from "recoil-nexus"
import {
  Connection,
  EntityManager,
  getConnection,
  SelectQueryBuilder,
} from "typeorm"

import { profileState, tokenState } from "../recoil/profile"
import { AssetEntity, AssetSchema } from "../store/database/entity/asset"
import { FiatEntity } from "../store/database/entity/fiat"
import {
  SnaphostEntity,
  SnapshotSchema,
} from "../store/database/entity/snapshot"
import { UserEntity } from "../store/database/entity/user"

class Service {
  private _client?: Client
  private token?: string

  private get client(): Client {
    const _token = getRecoil(tokenState)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.token === _token) return this._client!

    this.token = _token
    this._client = new Client(undefined, this.token)
    this._client.request.interceptors.response.use((data) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawData = data as any
      if (rawData.code) {
        if (rawData.code === 401) {
          setRecoil(tokenState, undefined)
        }
        throw rawData
      }
      return rawData
    })
    return this._client
  }

  private get database(): Connection {
    return getConnection()
  }

  private get profile(): User | undefined {
    return getRecoil(profileState)
  }

  async updateProfile() {
    if (!this.client) return
    const profile = await this.client.userMe()
    setRecoil(profileState, profile)
  }

  async updateAssets() {
    const [assets, fiats] = await Promise.all([
      this.client.readAssets(),
      this.client.readExchangeRates(),
    ])
    await this.database.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(AssetEntity)
        .set({ balance: "0.0" })
        .execute()
      await manager.save(AssetEntity, assets)
      await manager.save(FiatEntity, fiats)
    })

    queryClient.invalidateQueries("asset")
    queryClient.invalidateQueries("fiat")
  }

  async updateAsset(assetId: string) {
    const [assets, fiats] = await Promise.all([
      this.client.readAsset(assetId),
      this.client.readExchangeRates(),
    ])
    await this.database.transaction(async (manager) => {
      await manager.save(AssetEntity, assets)
      await manager.save(FiatEntity, fiats)
    })

    queryClient.invalidateQueries("asset")
    queryClient.invalidateQueries("fiat")
  }

  async updateAssetSnapshots(assetId: string, offset?: string, limit = 30) {
    const [list, insertAsset] = await Promise.all([
      this.client.readSnapshots({ asset: assetId, offset, limit }),
      this._checkAssetExistWithReturnInsert(assetId),
    ])

    const insertUsers = await this._checkUsersExistWithReturnInsert(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      list.filter((a) => a.opponent_id).map((s) => s.opponent_id!)
    )

    await this.database.transaction(async (manager) => {
      await manager.save(SnaphostEntity, list)
      insertAsset && (await insertAsset(manager))
      insertUsers && (await insertUsers(manager))
    })

    queryClient.invalidateQueries("snapshot")
    insertAsset && queryClient.invalidateQueries("asset")
    insertUsers && queryClient.invalidateQueries("user")
  }

  async updateSnapshot(snapshotId: string) {
    const snapshot = await this.client.readSnapshot(snapshotId)

    const [insertAsset, insertUsers] = await Promise.all([
      this._checkAssetExistWithReturnInsert(snapshot.asset_id),
      this._checkUsersExistWithReturnInsert(
        [snapshot.opponent_id, snapshot.user_id]
          .filter((e) => !!e)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map((e) => e!)
      ),
    ])

    await this.database.transaction(async (manager) => {
      await manager.save(SnaphostEntity, snapshot)
      insertAsset && (await insertAsset(manager))
      insertUsers && (await insertUsers(manager))
    })

    queryClient.invalidateQueries("snapshot")
    insertAsset && queryClient.invalidateQueries("asset")
    insertUsers && queryClient.invalidateQueries("user")
  }

  assetResults(currentFiat?: string): SelectQueryBuilder<AssetSchema> {
    const _currentFiat = currentFiat ?? this.profile?.fiat_currency ?? "USD"
    return this.database
      .createQueryBuilder(AssetEntity, "asset")
      .select()
      .leftJoinAndMapOne(
        "asset.chain",
        "asset",
        "chain",
        "chain.asset_id = asset.chain_id"
      )
      .leftJoinAndMapOne(
        "asset.extra",
        "asset_extra",
        "extra",
        "extra.asset_id = asset.asset_id"
      )
      .innerJoinAndMapOne(
        "asset.fiat",
        "fiat",
        "fiat",
        "fiat.code = :currentFiat",
        { currentFiat: _currentFiat }
      )
  }

  snapshotResults(currentFiat?: string): SelectQueryBuilder<SnapshotSchema> {
    const _currentFiat = currentFiat ?? this.profile?.fiat_currency ?? "USD"
    return this.database
      .createQueryBuilder(SnaphostEntity, "snapshot")
      .select()
      .leftJoinAndMapOne(
        "snapshot.asset",
        "asset",
        "asset",
        "asset.asset_id = snapshot.asset_id"
      )
      .leftJoinAndMapOne(
        "snapshot.chain",
        "asset",
        "chain",
        "chain.asset_id = asset.chain_id"
      )
      .leftJoinAndMapOne(
        "snapshot.opponent",
        "user",
        "opponent",
        "opponent.user_id = snapshot.opponent_id"
      )
      .innerJoinAndMapOne(
        "snapshot.fiat",
        "fiat",
        "fiat",
        "fiat.code = :currentFiat",
        { currentFiat: _currentFiat }
      )
  }

  ticker(assetId: string, offset?: string) {
    return this.client.readAssetNetworkTicker(assetId, offset)
  }

  private async _checkAssetExistWithReturnInsert(assetId: string) {
    const dbAsset = await this.database
      .createQueryBuilder(AssetEntity, "asset")
      .leftJoinAndMapOne(
        "asset.chain",
        "asset",
        "chain",
        "chain.asset_id = asset.chain_id"
      )
      .where("asset.asset_id = :assetId", { assetId })
      .limit(1)
      .getOne()

    if (dbAsset && dbAsset.chain) return

    const assetPromise = !dbAsset ? this.client.readAsset(assetId) : undefined
    const chainPromise =
      !dbAsset?.chain && dbAsset?.chain_id
        ? this.client.readAsset(dbAsset.chain_id)
        : undefined

    const [asset, chain] = await Promise.all([assetPromise, chainPromise])
    return (manager: EntityManager) => {
      asset && manager.save(AssetEntity, asset)
      chain && manager.save(AssetEntity, chain)
    }
  }

  private async _checkUsersExistWithReturnInsert(userIds: string[]) {
    if (userIds.length === 0) return

    const userIdSet = Array.from(new Set(userIds))

    const existUserIds = (
      await this.database
        .createQueryBuilder(UserEntity, "user")
        .where("user.user_id IN (:...userIdSet)", { userIdSet })
        .getMany()
    ).map((u) => u.user_id)

    const userNeedFetch = userIdSet.filter(
      (userId) => !existUserIds.includes(userId)
    )

    if (userNeedFetch.length === 0) return

    const users = await this.client.readUsers(userNeedFetch)

    return (manager: EntityManager) => manager.save(UserEntity, users)
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 100,
    },
  },
})
const service = new Service()
export default service
