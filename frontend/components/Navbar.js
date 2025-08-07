import { 
  Box, 
  Flex, 
  Text, 
                {/*
                <Button
                  key="test"
                  variant={isActivePage('/test-time') ? 'solid' : 'ghost'}
                  colorScheme="brand"
                  onClick={() => router.push('/test-time')}
                >
                  Test
                </Button>
                */}
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const router = useRouter()
  const { isLoggedIn, username, loading, logout } = useAuth()

  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const isActivePage = (path) => {
    return router.pathname === path
  }

  return (
    <Box 
      bg={bg} 
      borderBottom="1px" 
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" py={4}>
          {/* Logo and main nav */}
          <Flex align="center" gap={8}>
            <Text 
              fontSize="xl" 
              fontWeight="bold" 
              color="brand.600"
              cursor="pointer"
              onClick={() => router.push('/')}
            >
              CFB VOTING
            </Text>
            
            <HStack spacing={4}>
              <Button 
                variant={isActivePage('/vote') ? 'solid' : 'ghost'}
                colorScheme="brand"
                size="sm"
                onClick={() => router.push('/vote')}
              >
                Vote
              </Button>
              <Button 
                variant={isActivePage('/leaderboard') ? 'solid' : 'ghost'}
                colorScheme="brand"
                size="sm"
                onClick={() => router.push('/leaderboard')}
              >
                Leaderboard
              </Button>
              <Button 
                variant={isActivePage('/test-time') ? 'solid' : 'ghost'}
                colorScheme="brand"
                size="sm"
                onClick={() => router.push('/test-time')}
              >
                Test
              </Button>
              <Button 
                variant={isActivePage('/history') ? 'solid' : 'ghost'}
                colorScheme="brand"
                size="sm"
                onClick={() => router.push('/history')}
              >
                History
              </Button>
            </HStack>
          </Flex>

          {/* Auth status */}
          <Flex align="center" gap={4}>
            {loading ? (
              <Text fontSize="sm" color="gray.500">Loading...</Text>
            ) : isLoggedIn ? (
              <>
                <VStack spacing={0} align="start">
                  <Text fontSize="sm" color="gray.500">Welcome</Text>
                  <Text fontSize="sm" fontWeight="medium">{username}</Text>
                </VStack>
                <Button 
                  variant="outline" 
                  colorScheme="brand"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost"
                  colorScheme="brand"
                  size="sm"
                  onClick={() => router.push('/login')}
                >
                  Login
                </Button>
                <Button 
                  variant="outline"
                  colorScheme="brand"
                  size="sm"
                  onClick={() => router.push('/register')}
                >
                  Register
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
} 