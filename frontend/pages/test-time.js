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
  CardHeader,
  Badge,
  Alert,
  AlertIcon,
  useColorModeValue,
  Spinner,
  Center,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid
} from '@chakra-ui/react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function TestTime() {
  const [testResults, setTestResults] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/vote/test/stats`)
      setStats(response.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const runTest = async (testType) => {
    setLoading(true)
    setError('')
    
    try {
      let response
      if (testType === 'register') {
        response = await axios.post(`${API_URL}/api/auth/register`, {
          username: `testuser${Date.now()}`,
          password: 'testpass123'
        })
      } else if (testType === 'vote') {
        response = await axios.post(`${API_URL}/api/vote/test/vote`, {
          username: `testuser${Date.now()}`,
          week: 1
        })
      } else if (testType === 'consensus') {
        response = await axios.get(`${API_URL}/api/vote/consensus/1`)
      }

      setTestResults(prev => [...prev, {
        type: testType,
        success: true,
        data: response.data,
        timestamp: new Date().toLocaleTimeString()
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: testType,
        success: false,
        error: error.response?.data?.error || 'Test failed',
        timestamp: new Date().toLocaleTimeString()
      }])
    } finally {
      setLoading(false)
      loadStats()
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="2xl" mb={2}>
            Testing Suite
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Test the voting system and time-based features
          </Text>
        </Box>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Stats Panel */}
        {stats && (
          <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
            <CardHeader>
              <Heading size="md">System Statistics</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Stat>
                  <StatLabel>Total Users</StatLabel>
                  <StatNumber>{stats.total_users}</StatNumber>
                  <StatHelpText>Registered accounts</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Active Weeks</StatLabel>
                  <StatNumber>{stats.weeks.length}</StatNumber>
                  <StatHelpText>Weeks with votes</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Total Votes</StatLabel>
                  <StatNumber>
                    {stats.weeks.reduce((sum, week) => sum + week.total_votes, 0)}
                  </StatNumber>
                  <StatHelpText>All time votes cast</StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Test Controls */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
          <CardHeader>
            <Heading size="md">Test Controls</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <HStack spacing={4} wrap="wrap">
                <Button
                  colorScheme="blue"
                  onClick={() => runTest('register')}
                  isLoading={loading}
                >
                  Test User Registration
                </Button>
                <Button
                  colorScheme="green"
                  onClick={() => runTest('vote')}
                  isLoading={loading}
                >
                  Test Vote Submission
                </Button>
                <Button
                  colorScheme="purple"
                  onClick={() => runTest('consensus')}
                  isLoading={loading}
                >
                  Test Consensus Calculation
                </Button>
                <Button
                  variant="outline"
                  onClick={clearResults}
                  isDisabled={testResults.length === 0}
                >
                  Clear Results
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Test Results */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Test Results</Heading>
              <Badge colorScheme="blue" variant="solid">
                {testResults.length} tests
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            {testResults.length === 0 ? (
              <Text color="gray.600" textAlign="center" py={8}>
                No tests run yet. Click a test button above to get started.
              </Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {testResults.map((result, index) => (
                  <Box
                    key={index}
                    p={4}
                    border="1px"
                    borderColor={result.success ? 'green.200' : 'red.200'}
                    bg={result.success ? 'green.50' : 'red.50'}
                    borderRadius="md"
                  >
                    <HStack justify="space-between" mb={2}>
                      <HStack>
                        <Badge 
                          colorScheme={result.success ? 'green' : 'red'} 
                          variant="solid"
                        >
                          {result.type}
                        </Badge>
                        <Text fontSize="sm" color="gray.600">
                          {result.timestamp}
                        </Text>
                      </HStack>
                      <Badge 
                        colorScheme={result.success ? 'green' : 'red'} 
                        variant="outline"
                      >
                        {result.success ? 'PASS' : 'FAIL'}
                      </Badge>
                    </HStack>
                    
                    {result.success ? (
                      <Text fontSize="sm" color="green.700">
                        Test completed successfully
                      </Text>
                    ) : (
                      <Text fontSize="sm" color="red.700">
                        Error: {result.error}
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Week Details */}
        {stats && stats.weeks.length > 0 && (
          <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
            <CardHeader>
              <Heading size="md">Week Details</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {stats.weeks.map((week, index) => (
                  <Box
                    key={week.week}
                    p={4}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                  >
                    <HStack justify="space-between">
                      <Heading size="sm">Week {week.week}</Heading>
                      <HStack spacing={4}>
                        <Badge colorScheme="blue" variant="outline">
                          {week.voters} voters
                        </Badge>
                        <Badge colorScheme="green" variant="outline">
                          {week.total_votes} votes
                        </Badge>
                      </HStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  )
} 