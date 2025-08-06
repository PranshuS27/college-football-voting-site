import { useState } from 'react'
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
  useToast
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()
  const toast = useToast()

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Log the payload for debugging
    console.log('Login payload:', { username, password })

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      }, { withCredentials: true })

      // Update global auth state
      await login(username)
      
      toast({
        title: "Login successful!",
        description: `Welcome back, ${username}!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      router.push('/vote')
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="container.sm" py={12}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="2xl" mb={2}>
            Login
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Sign in to your account to start voting
          </Text>
        </Box>

        <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
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
                  isLoading={loading}
                >
                  Login
                </Button>

                <HStack spacing={4} w="full">
                  <Text fontSize="sm" color="gray.600">
                    Don't have an account?
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
  )
}
