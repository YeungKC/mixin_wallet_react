import { FC, Suspense } from "react"
import { Navigate, useLocation, useSearchParams } from "react-router-dom"

import { LoadingPage } from "../pages/loading"
import { setLocationFrom, useHasTokenValue } from "../recoil/profile"
import DatabaseInit from "./database_init"

const RequireAuthAndDatabase: FC = ({ children }) => {
  const hasToken = useHasTokenValue()
  const [params] = useSearchParams()
  const location = useLocation()

  if (!hasToken) {
    setLocationFrom(`${location.pathname}${location.search}`)
    return (
      <Navigate
        to={`/auth?${params.toString()}`}
        state={{ from: location }}
        replace
      />
    )
  }

  return (
    <DatabaseInit>
      <Suspense fallback={<LoadingPage />}>{children}</Suspense>
    </DatabaseInit>
  )
}

export default RequireAuthAndDatabase
