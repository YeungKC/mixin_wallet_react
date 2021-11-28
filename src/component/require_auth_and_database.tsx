import { FC, Suspense } from "react"
import { useSearchParams, useLocation, Navigate } from "react-router-dom"
import { LoadingPage } from "../pages/loading"
import { useHasTokenValue } from "../recoil/profile"
import DatabaseInit from "./database_init"
import UpdateAssets from "./service/update_assets"

const RequireAuthAndDatabase: FC = ({ children }) => {
  const hasToken = useHasTokenValue()
  const [params] = useSearchParams()
  const location = useLocation()

  if (!hasToken) {
    return <Navigate to={`/auth?${params.toString()}`} state={{ from: location }} replace />
  }

  return (
    <Suspense fallback={<LoadingPage />}>
      <DatabaseInit>
        <UpdateAssets />
        {children}
      </DatabaseInit>
    </Suspense>
  )
}

export default RequireAuthAndDatabase