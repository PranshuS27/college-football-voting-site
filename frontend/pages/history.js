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
  Button,
  ButtonGroup,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function History() {
  const [sport, setSport] = useState('cfb')
  const [voteHistory, setVoteHistory] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    let cancelled = false
    const loadVoteHistory = async () => {
      setLoading(true)
      setError('')
      try {
        const endpoint = sport === 'nfl' ? '/api/vote/nfl/my_votes' : '/api/vote/my_votes'
        const response = await axios.get(`${API_URL}${endpoint}`, { withCredentials: true })
        if (!cancelled) setVoteHistory(response.data)
      } catch (err) {
        console.error('Error loading vote history:', err)
        if (!cancelled) {
          setError('Failed to load vote history')
          setVoteHistory({})
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadVoteHistory()
    return () => { cancelled = true }
  }, [sport])

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Vote History
          </Heading>
          <ButtonGroup size="md" isAttached variant="outline">
            <Button
              colorScheme="brand"
              variant={sport === 'cfb' ? 'solid' : 'outline'}
              onClick={() => setSport('cfb')}
            >
              CFB
            </Button>
            <Button
              colorScheme="brand"
              variant={sport === 'nfl' ? 'solid' : 'outline'}
              onClick={() => setSport('nfl')}
            >
              NFL
            </Button>
          </ButtonGroup>
        </Box>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {loading ? (
          <Center py={12}>
            <Spinner size="xl" color="brand.500" />
          </Center>
        ) : Object.keys(voteHistory).length === 0 ? (
          <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
            <CardBody textAlign="center" py={12}>
              <Text fontSize="lg" color="gray.600">
                No {sport.toUpperCase()} ballots yet.
              </Text>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={6} w="full">
            {Object.entries(voteHistory)
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([week, ballot]) => (
                <Card key={week} bg={cardBg} border="1px" borderColor={borderColor} w="full">
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Week {week}</Heading>
                      <Badge colorScheme="blue" variant="solid">
                        {ballot.ranked.length} ranked
                        {sport === 'cfb' && ballot.considered?.length > 0 &&
                          `, ${ballot.considered.length} considered`}
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={2} align="stretch">
                      {ballot.ranked.map((team, index) => (
                        <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                          <HStack>
                            <Badge colorScheme="green" variant="solid" minW="30px">
                              {index + 1}
                            </Badge>
                            <Text>{team}</Text>
                          </HStack>
                        </HStack>
                      ))}
                      {sport === 'cfb' && ballot.considered?.length > 0 && (
                        <>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.600" pt={2}>
                            Considered (0 pts)
                          </Text>
                          {ballot.considered.map((team, index) => (
                            <HStack key={`c-${index}`} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                              <HStack>
                                <Badge colorScheme="gray" variant="solid" minW="30px">—</Badge>
                                <Text>{team}</Text>
                              </HStack>
                            </HStack>
                          ))}
                        </>
                      )}
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
