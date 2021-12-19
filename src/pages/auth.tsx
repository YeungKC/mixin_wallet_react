import {
  getLocationFrom,
  useSetProfileState,
  useTokenState,
} from "../recoil/profile"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useEffect } from "react"
import { Client, authorizeToken } from "mixin-node-sdk"
import { LoadingPage } from "./loading"
import authBackground from "../assets/auth_background.webp"
import logo from "../assets/logo.webp"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"

const Auth = () => {
  const { t } = useTranslation()
  const [token, setToken] = useTokenState()
  const setProfile = useSetProfileState()

  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const code = params.get("code")

  useEffect(() => {
    const navigateBack = async () => {
      const from =
        (await getLocationFrom()) || location.state?.from?.pathname || "/"
      return navigate(from, { replace: true })
    }

    if (token) {
      navigateBack()
      return
    }
    if (!code) return

    const resetAuth = () => navigate("/auth", { replace: true })

    const login = async (code: string) => {
      try {
        const { access_token, scope } = await authorizeToken(
          process.env.REACT_APP_CLIENT_ID,
          code,
          process.env.REACT_APP_CLIENT_SECRET
        )

        if (!access_token) {
          toast.error(t("somethingWrong"))
          return resetAuth()
        }

        if (
          !scope ||
          !scope.includes("ASSETS:READ") ||
          !scope.includes("SNAPSHOTS:READ")
        ) {
          toast.error(t("requiredPermissions"))
          return resetAuth()
        }

        const profile = await new Client(undefined, access_token).userMe()

        setProfile(profile)
        setToken(access_token)

        navigateBack()
      } catch (_) {
        toast.error(t("somethingWrong"))
        return resetAuth()
      }
    }

    login(code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  if (code) return <LoadingPage />

  return <_Auth />
}

const _Auth = () => {
  const { t } = useTranslation()
  return (
    <div className="container w-screen h-screen flex flex-col pt-5 mb-8 items-center">
      <div className="relative">
        <img
          className="w-[360px] h-[360px] object-cover"
          src={authBackground}
        />
        <img
          className="w-[96px] h-[96px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          src={logo}
        />
      </div>
      <p className="text-2xl font-medium mb-4">{t("mixinWallet")}</p>
      <p className="px-8 text-center text-gray-500 mb-14">{t("authSlogan")}</p>
      <a
        className="rounded-full bg-black text-white px-6 py-4 mb-6"
        href={`https://mixin-www.zeromesh.net/oauth/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&scope=PROFILE:READ+ASSETS:READ+CONTACTS:READ+SNAPSHOTS:READ&response_type=code`}
      >
        {t("authorize")}
      </a>
      <p className="text-sm text-gray-300 px-12">{t("authHint")}</p>
    </div>
  )
}

export default Auth
