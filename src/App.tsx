import "./i18n"
import "react-toastify/dist/ReactToastify.css"
import "reflect-metadata"

import { FC, lazy, Suspense } from "react"
import { QueryClientProvider } from "react-query"
import { HashRouter, RouteObject, useRoutes } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { RecoilRoot } from "recoil"
import RecoilNexus from "recoil-nexus"

import RequireAuthAndDatabase from "./component/require_auth_and_database"
import UpdateProfile from "./component/service/update_profile"
import { LoadingPage } from "./pages/loading"
import { queryClient } from "./service/service"

const Providers: FC = ({ children }) => {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <RecoilNexus />
        <HashRouter>{children}</HashRouter>
      </QueryClientProvider>
    </RecoilRoot>
  )
}

const Auth = lazy(() => import("./pages/auth"))
const Home = lazy(() => import("./pages/home"))
const AssetDetail = lazy(() => import("./pages/asset_detail"))
const SnapshotDetail = lazy(() => import("./pages/snapshot_detail"))
const AssetDeposit = lazy(() => import("./pages/asset_deposit"))

function Content() {
  const routes = useRoutes([
    {
      path: "/auth",
      element: <Auth />,
    },
    { path: "*", element: <div>404 Not found</div> },
    ...[
      {
        path: "/",
        children: [
          { index: true, element: <Home /> },
          {
            path: "snapshot/:snapshotId",
            children: [{ index: true, element: <SnapshotDetail /> }],
          },
          {
            path: "/asset/:assetId",
            children: [
              { index: true, element: <AssetDetail /> },
              { path: "deposit", element: <AssetDeposit /> },
            ],
          },
        ],
      },
    ].map((e) => {
      const wrapper = (routeObject: RouteObject) => {
        if (routeObject.element) {
          routeObject.element = (
            <RequireAuthAndDatabase>
              {routeObject.element}
            </RequireAuthAndDatabase>
          )
        }
        routeObject.children?.forEach((routeObject) => wrapper(routeObject))
      }
      wrapper(e)
      return e
    }),
  ])
  return (
    <div>
      <UpdateProfile />
      <Suspense fallback={<LoadingPage />}>{routes}</Suspense>
    </div>
  )
}

function App() {
  return (
    <>
      <Providers>
        <Content />
      </Providers>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  )
}

export default App
