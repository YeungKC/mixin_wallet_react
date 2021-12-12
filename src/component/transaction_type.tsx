import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

const TransactionType: FC<{ type: string }> = ({ type }) => {
    const [t] = useTranslation()
    const typeText = useMemo(() => {
        switch (type) {
            case 'pending':
                return t('depositing')
            case 'deposit':
                return t('deposit')
            case 'transfer':
                return t('transfer')
            case 'withdrawal':
                return t('withdrawal')
            case 'fee':
                return t('fee')
            case 'rebate':
                return t('rebate')
            case 'raw':
                return t('raw')
            default:
                return type

        }
    }, [type, t])
    return <>{typeText}</>
}

export default TransactionType