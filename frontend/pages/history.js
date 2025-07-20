import { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  Card, 
  CardBody, 
  CardHeader,
  Badge,
  HStack,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function History() {
  const [voteHistory, setVoteHistory] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    loadVoteHistory()
  }, [])

  const loadVoteHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/vote/my_votes`, { withCredentials: true })
      setVoteHistory(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading vote history:', error)
      setError('Failed to load vote history')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading your vote history...</Text>
        </VStack>
      </Center>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="2xl" mb={2}>
            Your Vote History
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Review your past ballots and voting activity
          </Text>
        </Box>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {Object.keys(voteHistory).length === 0 ? (
          <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
            <CardBody textAlign="center" py={12}>
              <Text fontSize="lg" color="gray.600">
                No vote history found. Start voting to see your ballots here!
              </Text>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={6} w="full">
            {Object.entries(voteHistory)
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([week, teams]) => (
                <Card key={week} bg={cardBg} border="1px" borderColor={borderColor} w="full">
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Week {week}</Heading>
                      <Badge colorScheme="blue" variant="solid">
                        {teams.length} teams
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={2} align="stretch">
                      {teams.map((team, index) => (
                        <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                          <HStack>
                            <Badge colorScheme="green" variant="solid" minW="30px">
                              {index + 1}
                            </Badge>
                            <Text>{team}</Text>
                          </HStack>
                        </HStack>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              ))}
          </VStack>
        )}
      </VStack>
    </Container>
  )
}
