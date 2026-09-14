import { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  Card, 
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  useColorModeValue,
  useToast,
  Flex
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login, isLoggedIn, loading: authLoading } = useAuth()
  const toast = useToast()

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.replace('/vote')
    }
  }, [isLoggedIn, authLoading, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await login(username, password)
      if (result.success) {
        toast({
          title: "Login successful!",
          description: `Welcome back, ${username}!`,
          status: "success",
          duration: 3000,
          isClosable: true,
        })
        router.push('/vote')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(to-br, brand.900, brand.700, brand.500)"
      px={4}
      py={12}
    >
      <Container maxW="md">
        <VStack spacing={8}>
          <Heading size="2xl" color="white" fontFamily="heading" textAlign="center">
            Log in
          </Heading>

          <Card
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            w="full"
            shadow="2xl"
            borderRadius="xl"
          >
            <CardBody p={{ base: 6, md: 8 }}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  {error && (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}

                  <FormControl isRequired>
                    <FormLabel>Username</FormLabel>
                    <Input
                      type="text"
                      size="lg"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      autoFocus
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      size="lg"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    h="14"
                    fontSize="lg"
                    isLoading={loading}
                  >
                    Log in
                  </Button>

                  <HStack spacing={2} w="full" justify="center">
                    <Text fontSize="sm" color="gray.600">
                      Don&apos;t have an account?
                    </Text>
                    <Button
                      variant="link"
                      colorScheme="brand"
                      size="sm"
                      onClick={() => router.push('/register')}
                    >
                      Register here
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Flex>
  )
}
