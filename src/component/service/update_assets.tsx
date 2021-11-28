import { useEffect } from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"
import { useHasTokenValue } from "../../recoil/profile"
import service from "../../service/service"

const toastId = 'updateAssets'

const UpdateAssets = () => {
    const hasToken = useHasTokenValue()
    const location = useLocation()
    const [params] = useSearchParams()
    useEffect(() => {
        if (!hasToken) return
        const pormise = service.updateAssets()
        const isNotHome = location.pathname !== '/' || !!params.toString()
        if (isNotHome) return

        toast.promise(pormise, {
            pending: 'Promise is pending',
            success: 'Promise resolved 👌',
            error: 'Promise rejected 🤯'
        }, {
            toastId: toastId,
            autoClose: 1000,
            pauseOnFocusLoss: false
        })

        return () => {
            if (isNotHome) return
            toast.dismiss(toastId)
        }
    })
    return null
}

export default UpdateAssets