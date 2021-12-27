import "./i18n"
import "react-toastify/dist/ReactToastify.css"
import "reflect-metadata"

import { FC, lazy, Suspense } from "react"
import { QueryClientProvider } from "react-query"
import { HashRouter, Route, Routes } from "react-router-dom"
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

function Content() {
  return (
    <div>
      <UpdateProfile />
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/snapshot/:snapshotId"
            element={
              <RequireAuthAndDatabase>
                <SnapshotDetail />
              </RequireAuthAndDatabase>
            }
          />
          <Route
            path="/asset/:assetId"
            element={
              <RequireAuthAndDatabase>
                <AssetDetail />
              </RequireAuthAndDatabase>
            }
          />
          <Route
            path="/"
            element={
              <RequireAuthAndDatabase>
                <Home />
              </RequireAuthAndDatabase>
            }
          />
        </Routes>
      </Suspense>
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
