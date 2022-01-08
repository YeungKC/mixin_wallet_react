const initSqlJs = require("sql.js")

import localforage from "localforage"
import { FC, useEffect, useMemo, useState } from "react"
import { createConnection, getConnection } from "typeorm"

import { LoadingPage } from "../pages/loading"
import { AddressEntity } from "../store/database/entity/address"
import { AssetEntity } from "../store/database/entity/asset"
import { AssetExtraEntity } from "../store/database/entity/asset_extra"
import { FiatEntity } from "../store/database/entity/fiat"
import { SnaphostEntity } from "../store/database/entity/snapshot"
import { UserEntity } from "../store/database/entity/user"
import sqlWasm from "./sql_wasm"

const DatabaseInit: FC = ({ children }) => {
  const initialized = useMemo(() => {
    try {
      getConnection()
      return true
    } catch (e) {
      return false
    }
  }, [])
  const [loading, setLoading] = useState(!initialized)
  useEffect(() => {
    const initDatabase = async () => {
      if (initialized) return

      setLoading(true)

      window.localforage = localforage
      try {
        getConnection()
      } catch (e) {
        await createConnection({
          type: "sqljs",
          autoSave: true,
          driver: await initSqlJs({ locateFile: () => sqlWasm }),
          useLocalForage: true,
          synchronize: true,
          location: "wallet",
          entities: [
            AddressEntity,
            AssetEntity,
            AssetExtraEntity,
            FiatEntity,
            SnaphostEntity,
            UserEntity,
          ],
          logging: ["error"],
        })
      } finally {
        setLoading(false)
      }
    }
    initDatabase()
  })

  if (loading) return <LoadingPage />

  return <>{children}</>
}

export default DatabaseInit
