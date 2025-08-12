import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td,
  Badge,
  Select,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Spinner,
  Center
} from '@chakra-ui/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function Leaderboard() {
  const [previousRankings, setPreviousRankings] = useState([])
  const [rankedTeams, setRankedTeams] = useState([])
  const [unrankedTeams, setUnrankedTeams] = useState([])
  const [selectedWeek, setSelectedWeek] = useState('all')
  const [loading, setLoading] = useState(true)
  const [availableWeeks, setAvailableWeeks] = useState([])

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    loadRankings()
  }, [selectedWeek])

  const loadRankings = async () => {
    // Load previous week rankings for arrow indicators
    let prevWeek = null
    if (selectedWeek !== 'all') {
      const weekNum = parseInt(selectedWeek)
      if (!isNaN(weekNum) && weekNum > 1) {
        prevWeek = weekNum - 1
      }
    }
    if (prevWeek) {
      try {
        const prevResponse = await axios.get(`${API_URL}/api/vote/consensus/${prevWeek}`)
        setPreviousRankings(prevResponse.data.ranked || [])
      } catch {
        setPreviousRankings([])
      }
    } else {
      setPreviousRankings([])
    }
    setLoading(true)
    try {
      let response;
      if (selectedWeek === 'all') {
        response = await axios.get(`${API_URL}/api/vote/leaderboard/overall`)
      } else {
        response = await axios.get(`${API_URL}/api/vote/consensus/${selectedWeek}`)
      }
      setRankedTeams(response.data.ranked || [])
      setUnrankedTeams(response.data.unranked || [])
    } catch (error) {
      console.error('Error loading rankings:', error)
      setRankedTeams([])
      setUnrankedTeams([])
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableWeeks = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/vote/test/stats`)
      const weeks = response.data.weeks.map(w => w.week)
      setAvailableWeeks(weeks)
    } catch (error) {
      console.error('Error loading weeks:', error)
    }
  }

  useEffect(() => {
    loadAvailableWeeks()
  }, [])

  const getRankingColor = (rank) => {
    if (rank <= 5) return 'green'
    if (rank <= 10) return 'blue'
    if (rank <= 15) return 'orange'
    if (rank <= 20) return 'red'
    return 'gray'
  }

  const formatPoints = (points) => {
    return points ? points.toLocaleString() : '0'
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="2xl" mb={2}>
            Team Leaderboard
          </Heading>
          <Text fontSize="lg" color="gray.600">
            {selectedWeek === 'all' 
              ? 'Overall rankings based on all votes across all weeks'
              : `Week ${selectedWeek} rankings`
            }
          </Text>
        </Box>

        <Select 
          value={selectedWeek} 
          onChange={(e) => setSelectedWeek(e.target.value)}
          maxW="300px"
          size="lg"
        >
          <option value="all">All Weeks Combined</option>
          {availableWeeks.map(week => (
            <option key={week} value={week}>Week {week}</option>
          ))}
        </Select>

        {loading ? (
          <Center py={12}>
            <VStack spacing={4}>
              <Spinner size="xl" color="brand.500" />
              <Text>Loading rankings...</Text>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} w="full">
            {/* Top 25 Table */}
            <Box gridColumn={{ lg: 'span 2' }}>
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Top 25 Teams</Heading>
                </CardHeader>
                <CardBody>
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Rank</Th>
                          <Th>Team</Th>
                          <Th isNumeric>Points</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {rankedTeams.map((team, index) => {
                          // Find previous rank
                          let arrow = null
                          if (previousRankings.length > 0) {
                            const prevIndex = previousRankings.findIndex(t => t.team === team.team)
                            if (prevIndex === -1) {
                              arrow = <span title="New this week" style={{color: 'green'}}>↑</span>
                            } else if (prevIndex > index) {
                              arrow = <span title="Moved up" style={{color: 'green'}}>↑</span>
                            } else if (prevIndex < index) {
                              arrow = <span title="Moved down" style={{color: 'red'}}>↓</span>
                            } else {
                              arrow = <span title="No change" style={{color: 'gray'}}>→</span>
                            }
                          }
                          return (
                            <Tr key={team.team}>
                              <Td>
                                <Badge 
                                  colorScheme={getRankingColor(index + 1)}
                                  variant="solid"
                                  fontSize="sm"
                                  px={2}
                                  py={1}
                                >
                                  {index + 1}
                                </Badge>
                              </Td>
                              <Td>
                                <Text fontWeight={index < 10 ? 'bold' : 'normal'}>
                                  {team.team} {arrow}
                                </Text>
                              </Td>
                              <Td isNumeric>
                                <Text fontWeight="bold">
                                  {formatPoints(team.points)}
                                </Text>
                              </Td>
                              <Td>
                                {index < 5 && <Badge colorScheme="green">Top 5</Badge>}
                                {index >= 5 && index < 10 && <Badge colorScheme="blue">Top 10</Badge>}
                                {index >= 10 && index < 15 && <Badge colorScheme="orange">Top 15</Badge>}
                                {index >= 15 && index < 20 && <Badge colorScheme="red">Top 20</Badge>}
                                {index >= 20 && <Badge colorScheme="gray">Top 25</Badge>}
                              </Td>
                            </Tr>
                          )
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                </CardBody>
              </Card>
              {/* Unranked Teams Table */}
              {unrankedTeams.length > 0 && (
                <Card bg={cardBg} border="1px" borderColor={borderColor} mt={8}>
                  <CardHeader>
                    <Heading size="sm">Teams That Got Votes (Not Ranked)</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Team</Th>
                            <Th isNumeric>Votes</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {unrankedTeams.map(team => (
                            <Tr key={team.team}>
                              <Td>{team.team}</Td>
                              <Td isNumeric>{formatPoints(team.points)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </CardBody>
                </Card>
              )}
            </Box>

            {/* Stats Panel */}
            <Box>
              <Card bg={cardBg} border="1px" borderColor={borderColor} h="fit-content">
                <CardHeader>
                  <Heading size="md">Statistics</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Stat>
                      <StatLabel>Total Teams</StatLabel>
                      <StatNumber>{overallRankings.length}</StatNumber>
                      <StatHelpText>Teams that received votes</StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel>Highest Scoring</StatLabel>
                      <StatNumber fontSize="lg">
                        {rankedTeams[0]?.team || 'N/A'}
                      </StatNumber>
                      <StatHelpText>
                        {formatPoints(rankedTeams[0]?.points || 0)} points
                      </StatHelpText>
                    </Stat>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Scoring System
                      </Text>
                      <VStack spacing={1} align="start">
                        <Text fontSize="xs">1st place = 25 points</Text>
                        <Text fontSize="xs">2nd place = 24 points</Text>
                        <Text fontSize="xs">3rd place = 23 points</Text>
                        <Text fontSize="xs">...</Text>
                        <Text fontSize="xs">25th place = 1 point</Text>
                      </VStack>
                    </Box>

                    {selectedWeek === 'all' && (
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Available Weeks
                        </Text>
                        <HStack spacing={1} flexWrap="wrap">
                          {availableWeeks.map(week => (
                            <Badge key={week} variant="outline" fontSize="xs">
                              W{week}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </Box>
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  )
} 