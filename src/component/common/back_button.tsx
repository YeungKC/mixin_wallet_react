import { FC } from "react"
import { useNavigate } from "react-router-dom"

import back from "../../assets/ic_back.svg"
import Button from "./button"

const BackButton: FC = () => {
  const navigate = useNavigate()
  return (
    <Button
      to={{}}
      onClick={() => navigate(-1)}
      className="h-8 w-8 stroke-current text-black"
    >
      <img src={back} />
    </Button>
  )
}

export default BackButton
