import { useEffect } from 'react'
import { Center, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const router = useRouter()
  const { isLoggedIn, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    router.replace(isLoggedIn ? '/vote' : '/login')
  }, [isLoggedIn, loading, router])

  return (
    <Center minH="50vh">
      <Spinner size="xl" color="brand.600" thickness="4px" />
    </Center>
  )
}
