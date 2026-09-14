import { useEffect } from 'react'
import { Center, Spinner, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import Navbar from './Navbar'

const PUBLIC_PATHS = ['/login', '/register']

export default function AuthGate({ children }) {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const isPublicPath = PUBLIC_PATHS.includes(router.pathname)

  useEffect(() => {
    if (loading) return
    if (!isLoggedIn && !isPublicPath) {
      router.replace('/login')
    }
  }, [loading, isLoggedIn, isPublicPath, router])

  if (loading) {
    return (
      <Center minH="100vh" bg="gray.50">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.600" thickness="4px" />
          <Text color="gray.600" fontWeight="medium">
            Checking login status...
          </Text>
        </VStack>
      </Center>
    )
  }

  if (!isLoggedIn) {
    if (!isPublicPath) {
      return (
        <Center minH="100vh" bg="gray.50">
          <VStack spacing={4}>
            <Spinner size="xl" color="brand.600" thickness="4px" />
            <Text color="gray.600" fontWeight="medium">
              Redirecting to login...
            </Text>
          </VStack>
        </Center>
      )
    }

    return children
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
