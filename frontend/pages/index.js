import { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid, 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  VStack,
  HStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true })
      setIsLoggedIn(true)
      setUsername(response.data.username)
    } catch (error) {
      setIsLoggedIn(false)
      setUsername('')
    }
  }

  const features = [
    {
      title: 'Vote',
      description: 'Submit your weekly college football rankings',
      action: 'Start Voting',
      path: '/vote',
      color: 'blue'
    },
    {
      title: 'Leaderboard',
      description: 'See overall team rankings and statistics',
      action: 'View Rankings',
      path: '/leaderboard',
      color: 'green'
    },
    {
      title: 'History',
      description: 'Review your past votes and consensus results',
      action: 'View History',
      path: '/history',
      color: 'purple'
    },
    {
      title: 'Test',
      description: 'Test the voting system and time-based features',
      action: 'Run Tests',
      path: '/test-time',
      color: 'orange'
    }
  ]

  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={8}>
        <Box>
          <Heading 
            size="2xl" 
            mb={4}
            bgGradient="linear(to-r, brand.600, brand.400)"
            bgClip="text"
          >
            College Football Voting
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="2xl">
            Vote for your top 25 college football teams each week and see how your rankings compare to the consensus.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
          {features.map((feature, index) => (
            <Card 
              key={index}
              bg={cardBg}
              border="1px"
              borderColor={borderColor}
              _hover={{ 
                transform: 'translateY(-2px)',
                shadow: 'lg',
                transition: 'all 0.2s'
              }}
            >
              <CardHeader pb={2}>
                <Heading size="md" color={`${feature.color}.600`}>
                  {feature.title}
                </Heading>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={4} align="start">
                  <Text color="gray.600">
                    {feature.description}
                  </Text>
                  <Button 
                    colorScheme={feature.color}
                    onClick={() => router.push(feature.path)}
                    w="full"
                  >
                    {feature.action}
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {!isLoggedIn && (
          <Card bg={cardBg} border="1px" borderColor={borderColor} w="full" maxW="md">
            <CardBody>
              <VStack spacing={4}>
                <Text fontSize="lg" fontWeight="medium">
                  Get Started
                </Text>
                <HStack spacing={4} w="full">
                  <Button 
                    variant="outline" 
                    colorScheme="brand"
                    flex={1}
                    onClick={() => router.push('/login')}
                  >
                    Login
                  </Button>
                  <Button 
                    colorScheme="brand"
                    flex={1}
                    onClick={() => router.push('/register')}
                  >
                    Register
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  )
}
