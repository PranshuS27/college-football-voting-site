import { useState, useEffect } from 'react'
import { conferences } from '../data/conferences'
import { submitConferenceChampions, getConsensusConferenceChampions } from '../utils/conferenceChampionsApi'
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
  const [weekStats, setWeekStats] = useState([])
  const [previousRankings, setPreviousRankings] = useState([])
  const [rankedTeams, setRankedTeams] = useState([])
  const [unrankedTeams, setUnrankedTeams] = useState([])
  const [selectedWeek, setSelectedWeek] = useState('all')
  const [loading, setLoading] = useState(true)
  const [availableWeeks, setAvailableWeeks] = useState([])
  // Conference champion picker state
  const [championTab, setChampionTab] = useState(false)
  const [championSelections, setChampionSelections] = useState({})
  const [championSubmitting, setChampionSubmitting] = useState(false)
  const [championMessage, setChampionMessage] = useState('')
  const [consensusTab, setConsensusTab] = useState(false)
  const [consensusChampions, setConsensusChampions] = useState({})
  const handleSubmitChampions = async () => {
    setChampionSubmitting(true)
    setChampionMessage('')
    try {
      await submitConferenceChampions(championSelections)
      setChampionMessage('Your conference champion votes have been submitted!')
    } catch (e) {
      setChampionMessage('Error submitting votes')
    } finally {
      setChampionSubmitting(false)
    }
  }

  const loadConsensusChampions = async () => {
    try {
      const res = await getConsensusConferenceChampions()
      setConsensusChampions(res.data.consensus || {})
    } catch {}
  }

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
      setWeekStats(response.data.weeks)
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

        <HStack spacing={4}>
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
          <button
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: championTab ? '#3182ce' : '#e2e8f0', color: championTab ? 'white' : 'black', fontWeight: 'bold' }}
            onClick={() => { setChampionTab(!championTab); setConsensusTab(false); }}
          >
            Vote Conference Champions
          </button>
          <button
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: consensusTab ? '#3182ce' : '#e2e8f0', color: consensusTab ? 'white' : 'black', fontWeight: 'bold' }}
            onClick={() => { setConsensusTab(!consensusTab); setChampionTab(false); if (!consensusTab) loadConsensusChampions(); }}
          >
            Consensus Champions
          </button>
        </HStack>

        {championTab ? (
          <Box w="full" maxW="700px" bg={cardBg} border="1px" borderColor={borderColor} p={6} borderRadius="lg">
            <Heading size="md" mb={4}>Pick Conference Champions</Heading>
            <VStack align="stretch" spacing={4}>
              {conferences.map(conf => (
                <HStack key={conf.name} spacing={4}>
                  <Text minW="160px" fontWeight="bold">{conf.name}</Text>
                  <Select
                    value={championSelections[conf.name] || ''}
                    onChange={e => setChampionSelections({ ...championSelections, [conf.name]: e.target.value })}
                    placeholder={`Select champion`}
                    maxW="300px"
                  >
                    {conf.teams.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </Select>
                </HStack>
              ))}
            </VStack>
            <Box mt={6}>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleSubmitChampions}
                isLoading={championSubmitting}
                isDisabled={Object.keys(championSelections).length !== conferences.length}
              >
                Submit Conference Champion Votes
              </Button>
              {championMessage && (
                <Text mt={2} color="green.600">{championMessage}</Text>
              )}
            </Box>
            <Box mt={6}>
              <Heading size="sm" mb={2}>Copy-Paste List</Heading>
              <Box bg="#f7fafc" borderRadius="md" p={3} fontSize="sm" border="1px solid #e2e8f0">
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                  {conferences.map(conf => `${conf.name}: ${championSelections[conf.name] || ''}`).join('\n')}
                </pre>
              </Box>
            </Box>
          </Box>
        ) : consensusTab ? (
          <Box w="full" maxW="700px" bg={cardBg} border="1px" borderColor={borderColor} p={6} borderRadius="lg">
            <Heading size="md" mb={4}>Consensus Conference Champions</Heading>
            <VStack align="stretch" spacing={4}>
              {conferences.map(conf => (
                <HStack key={conf.name} spacing={4}>
                  <Text minW="160px" fontWeight="bold">{conf.name}</Text>
                  <Text fontWeight="bold" color="blue.600">
                    {consensusChampions[conf.name]?.team || 'No votes yet'}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    {consensusChampions[conf.name]?.votes ? `${consensusChampions[conf.name].votes} votes` : ''}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        ) : loading ? (
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
                      <StatLabel>Voters Per Week</StatLabel>
                      <Box>
                        {weekStats.map(w => (
                          <Text key={w.week} fontSize="sm">Week {w.week}: {w.voters} voters</Text>
                        ))}
                      </Box>
                    </Stat>
                    <Stat>
                      <StatLabel>Total Teams</StatLabel>
                      <StatNumber>{rankedTeams.length + unrankedTeams.length}</StatNumber>
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