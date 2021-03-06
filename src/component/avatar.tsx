import { User } from "mixin-node-sdk"
import { FC, HTMLAttributes, memo } from "react"

const defaultClassName = "text-lg h-8 w-8"

const Avatar: FC<{ user?: User } & HTMLAttributes<HTMLElement>> = memo(
  ({ user, className }) => {
    if (!user?.avatar_url) {
      return (
        <div
          className={`rounded-full bg-yellow-200 text-white ${defaultClassName} ${className}`}
        >
          {user?.full_name.at(0) ?? "?"}
        </div>
      )
    }
    return (
      <img
        src={user?.avatar_url}
        loading="lazy"
        className={`rounded-full ${defaultClassName} ${className}`}
      />
    )
  }
)

export default Avatar
