import { useEffect } from 'react'
import { useHasTokenValue } from '../../recoil/profile'
import service from '../../service/service'

const UpdateProfile = () => {
  const hasToken = useHasTokenValue()
  useEffect(() => {
    service.updateProfile()
  }, [hasToken])
  return null
}

export default UpdateProfile
