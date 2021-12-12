import { Client } from 'mixin-node-sdk'
import { User } from 'mixin-node-sdk/dist/types'
import { QueryClient } from 'react-query'
import { getRecoil, setRecoil } from 'recoil-nexus'
import { Connection, EntityManager, getConnection, SelectQueryBuilder } from 'typeorm'
import { profileState, tokenState, useProfileState } from '../recoil/profile'
import { AssetEntity, AssetSchema } from '../store/database/entity/asset'
import { FiatEntity } from '../store/database/entity/fiat'
import { SnaphostEntity, SnapshotSchema } from '../store/database/entity/snapshot'
import { UserEntity } from '../store/database/entity/user'

class Service {

  constructor() { }
  private _client?: Client
  private token?: string

  private get client(): Client {
    const _token = getRecoil(tokenState)

    if (this.token === _token) return this._client!

    this.token = _token
    this._client = new Client(undefined, this.token)
    this._client.request.interceptors.response.use((data) => {
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
    const [assets, fiats] = await Promise.all([this.client.readAssets(), this.client.readExchangeRates()])
    await this.database.transaction(async (manager) => {
      await manager.createQueryBuilder().update(AssetEntity).set({ balance: '0.0' }).execute()
      await manager.save(AssetEntity, assets)
      await manager.save(FiatEntity, fiats)
    })
  }

  async updateAsset(assetId: string) {
    const [assets, fiats] = await Promise.all([this.client.readAsset(assetId), this.client.readExchangeRates()])
    await this.database.transaction(async (manager) => {
      await manager.save(AssetEntity, assets)
      await manager.save(FiatEntity, fiats)
    })
  }

  async updateAssetSnapshots(assetId: string, offset?: string, limit = 30) {
    const [list, insertAsset] = await Promise.all([
      this.client.readSnapshots({ asset: assetId, offset, limit }),
      this._checkAssetExistWithReturnInsert(assetId),
    ])

    const insertUsers = await this._checkUsersExistWithReturnInsert(
      list.filter((a) => a.opponent_id).map((s) => s.opponent_id!)
    )

    await this.database.transaction(async (manager) => {
      await manager.save(SnaphostEntity, list)
      insertAsset && await insertAsset(manager)
      insertUsers && await insertUsers(manager)
    })

    queryClient.invalidateQueries('snapshot')
    insertAsset && queryClient.invalidateQueries('asset')
    insertUsers && queryClient.invalidateQueries('user')
  }

  assetResults(currentFiat?: string): SelectQueryBuilder<AssetSchema> {
    const _currentFiat = currentFiat ?? this.profile?.fiat_currency ?? 'USD'
    return this.database
      .createQueryBuilder(AssetEntity, 'asset')
      .select()
      .leftJoinAndMapOne('asset.chain', 'asset', 'chain', 'chain.asset_id = asset.chain_id')
      .leftJoinAndMapOne('asset.extra', 'asset_extra', 'extra', 'extra.asset_id = asset.asset_id')
      .innerJoinAndMapOne('asset.fiat', 'fiat', 'fiat', `fiat.code = :currentFiat`, { currentFiat: _currentFiat })
  }

  snapshotResults(currentFiat?: string): SelectQueryBuilder<SnapshotSchema> {
    const _currentFiat = currentFiat ?? this.profile?.fiat_currency ?? 'USD'
    return this.database
      .createQueryBuilder(SnaphostEntity, 'snapshot')
      .select()
      .leftJoinAndMapOne('snapshot.asset', 'asset', 'asset', 'asset.asset_id = snapshot.asset_id')
      .leftJoinAndMapOne('snapshot.opponenter', 'user', 'opponenter', 'opponenter.user_id = snapshot.opponent_id')
      .innerJoinAndMapOne('snapshot.fiat', 'fiat', 'fiat', `fiat.code = :currentFiat`, { currentFiat: _currentFiat })
  }


  private async _checkAssetExistWithReturnInsert(assetId: string) {
    if (await this.database
      .createQueryBuilder(AssetEntity, 'asset')
      .where('asset.asset_id = :assetId', { assetId })
      .limit(1)
      .getOne()) {
      return
    }

    const asset = await this.client.readAsset(assetId)
    return (manager: EntityManager) => manager.save(AssetEntity, asset)
  }

  private async _checkUsersExistWithReturnInsert(userIds: string[]) {
    if (userIds.length === 0) return

    const userIdSet = Array.from(new Set(userIds))

    const existUserIds = (await this.database
      .createQueryBuilder(UserEntity, 'user')
      .where('user.user_id IN (:...userIdSet)', { userIdSet })
      .getMany()).map((u) => u.user_id)

    const userNeedFetch = userIdSet.filter((userId) => !existUserIds.includes(userId))

    if (userNeedFetch.length === 0) return

    const users = await this.client.readUsers(userNeedFetch)

    return (manager: EntityManager) => manager.save(UserEntity, users)
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 100,
    }
  }
})
const service = new Service()
export default service
