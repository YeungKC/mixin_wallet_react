import { Client } from 'mixin-node-sdk'
import { User } from 'mixin-node-sdk/dist/types'
import { QueryClient } from 'react-query'
import { getRecoil, setRecoil } from 'recoil-nexus'
import { Connection, getConnection, SelectQueryBuilder } from 'typeorm'
import { profileState, tokenState, useProfileState } from '../recoil/profile'
import { AssetEntity, AssetSchema } from '../store/database/entity/asset'
import { FiatEntity } from '../store/database/entity/fiat'

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
    queryClient.invalidateQueries('asset')
    queryClient.invalidateQueries('fiat')
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
}

export const queryClient = new QueryClient()
const service = new Service()
export default service
