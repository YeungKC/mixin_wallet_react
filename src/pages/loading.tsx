import { useTranslation } from "react-i18next"

import { Spinner } from "../component/common/spinner"

export const LoadingPage = ({ showTips }: { showTips?: boolean }) => {
  const { t } = useTranslation()
  return (
    <div className="container h-screen flex flex-col justify-center items-center gap-7">
      <Spinner />
      {(showTips ?? true) && <p className="text-sm">{t("authTips")}</p>}
    </div>
  )
}
