import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"

import search from "../assets/ic_search_small.svg"
import { useSetQueryString } from "../util/router"
import Button from "./common/button"

const BottomSheetSearchHeader = ({ queryKey }: { queryKey: string }) => {
  const [params] = useSearchParams()
  const [keyword, setKeyword] = useState<string | undefined>(
    params.get(queryKey) || ""
  )
  const navigate = useNavigate()

  const keywordQuery = useSetQueryString({ [queryKey]: keyword })

  useEffect(() => {
    const interval = setTimeout(
      () => navigate({ search: keywordQuery }, { replace: true }),
      200
    )
    return () => clearInterval(interval)
  }, [navigate, keywordQuery])

  const closeSheet = useSetQueryString({ [queryKey]: null })

  const [t] = useTranslation()
  return (
    <div className="flex gap-2 p-4 sticky top-0 bg-white rounded-t-lg z-10">
      <div className="relative flex-grow">
        <input
          autoFocus
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="bg-gray-100 w-full rounded-full py-2 pr-4 pl-9 h-10"
        />
        <img
          src={search}
          className="absolute left-3 top-0 bottom-0 mt-auto mb-auto"
        />
      </div>

      <Button to={{ search: closeSheet }} className="p-2">
        {t("cancel")}
      </Button>
    </div>
  )
}

export default BottomSheetSearchHeader
