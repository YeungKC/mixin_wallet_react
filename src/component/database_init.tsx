import localforage from 'localforage'
import { FC, useEffect, useState } from 'react'
import { createConnection, getConnection, getManager, getRepository } from 'typeorm'
import { LoadingPage } from '../pages/loading'
import service from '../service/service'
import { AddressEntity } from '../store/database/entity/address'
import { AssetEntity } from '../store/database/entity/asset'
import { AssetExtraEntity } from '../store/database/entity/asset_extra'
import { FiatEntity } from '../store/database/entity/fiat'
import { SnaphostEntity } from '../store/database/entity/snapshot'
import { UserEntity } from '../store/database/entity/user'
const initSqlJs = require('sql.js')

const DatabaseInit: FC = ({ children }) => {
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const initDatabase = async () => {
      try {
        getConnection()
      } catch (e) {
        setLoading(true)

        window.localforage = localforage
        await createConnection({
          type: 'sqljs',
          autoSave: true,
          driver: await initSqlJs({
            locateFile: (file: string) => `static/wasm/${file}`,
          }),
          useLocalForage: true,
          synchronize: true,
          location: 'wallet',
          entities: [AddressEntity, AssetEntity, AssetExtraEntity, FiatEntity, SnaphostEntity, UserEntity],
          logging: true,
        })

        setLoading(false)
      }
    }
    initDatabase()
  })

  if (loading) return <LoadingPage />

  return <>{children}</>
}

export default DatabaseInit
