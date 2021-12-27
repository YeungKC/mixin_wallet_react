import { FC, HTMLAttributes } from "react"

import transactionDeposit from "../assets/transaction_deposit.svg"
import transactionNet from "../assets/transaction_net.svg"
import transactionWithdrawal from "../assets/transaction_withdrawal.svg"
import { SnapshotSchema } from "../store/database/entity/snapshot"
import Avatar from "./avatar"

const TransactionIcon: FC<
  { data: SnapshotSchema } & HTMLAttributes<HTMLAnchorElement>
> = ({ data, className }) => {
  switch (data.type) {
    case "transfer":
      return (
        <Avatar user={data.opponent} className={`w-10 h-10 ${className}`} />
      )
    case "deposit":
      return (
        <img
          src={transactionDeposit}
          loading="lazy"
          className={`rounded-full w-10 h-10 ${className}`}
        />
      )
    case "withdrawal":
      return (
        <img
          src={transactionWithdrawal}
          loading="lazy"
          className={`rounded-full w-10 h-10 ${className}`}
        />
      )
    default:
      return (
        <img
          src={transactionNet}
          loading="lazy"
          className={`rounded-full w-10 h-10 ${className}`}
        />
      )
  }
}

export default TransactionIcon
