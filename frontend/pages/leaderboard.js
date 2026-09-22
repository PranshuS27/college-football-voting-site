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
  Center,
  Button,
  ButtonGroup,
} from '@chakra-ui/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function Leaderboard() {
  const [sport, setSport] = useState('cfb')
  const [weekStats, setWeekStats] = useState([])
  const [previousRankings, setPreviousRankings] = useState([])
  const [rankedTeams, setRankedTeams] = useState([])
  const [unrankedTeams, setUnrankedTeams] = useState([])
  const [selectedWeek, setSelectedWeek] = useState('all')
  const [loading, setLoading] = useState(true)
  const [availableWeeks, setAvailableWeeks] = useState([])
  const [championTab, setChampionTab] = useState(false)
  const [championSelections, setChampionSelections] = useState({})
  const [championSubmitting, setChampionSubmitting] = useState(false)
  const [championMessage, setChampionMessage] = useState('')
  const [consensusTab, setConsensusTab] = useState(false)
  const [consensusChampions, setConsensusChampions] = useState({})

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const isNfl = sport === 'nfl'
  const topN = isNfl ? 32 : 25

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

  const switchSport = (next) => {
    if (next === sport) return
    setSport(next)
    setSelectedWeek('all')
    setChampionTab(false)
    setConsensusTab(false)
    setRankedTeams([])
    setUnrankedTeams([])
    setPreviousRankings([])
    setAvailableWeeks([])
    setWeekStats([])
  }

  useEffect(() => {
    let cancelled = false

    const consensusBase = sport === 'nfl' ? '/api/vote/nfl/consensus' : '/api/vote/consensus'
    const overallUrl = sport === 'nfl'
      ? '/api/vote/nfl/leaderboard/overall'
      : '/api/vote/leaderboard/overall'
    const statsUrl = sport === 'nfl' ? '/api/vote/nfl/stats' : '/api/vote/test/stats'

    const load = async () => {
      setLoading(true)

      let prevWeek = null
      if (selectedWeek !== 'all') {
        const weekNum = parseInt(selectedWeek, 10)
        if (!isNaN(weekNum) && weekNum > 1) prevWeek = weekNum - 1
      }

      try {
        const [statsRes, rankingsRes, prevRes] = await Promise.all([
          axios.get(`${API_URL}${statsUrl}`),
          selectedWeek === 'all'
            ? axios.get(`${API_URL}${overallUrl}`)
            : axios.get(`${API_URL}${consensusBase}/${selectedWeek}`),
          prevWeek
            ? axios.get(`${API_URL}${consensusBase}/${prevWeek}`).catch(() => null)
            : Promise.resolve(null),
        ])

        if (cancelled) return

        setAvailableWeeks((statsRes.data.weeks || []).map(w => w.week))
        setWeekStats(statsRes.data.weeks || [])
        setRankedTeams(rankingsRes.data.ranked || [])
        setUnrankedTeams(rankingsRes.data.unranked || [])
        setPreviousRankings(prevRes?.data?.ranked || [])
      } catch (error) {
        if (cancelled) return
        console.error('Error loading rankings:', error)
        setRankedTeams([])
        setUnrankedTeams([])
        setPreviousRankings([])
        setAvailableWeeks([])
        setWeekStats([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [selectedWeek, sport])

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
          <Heading size="2xl" mb={4}>
            Leaderboard
          </Heading>
          <ButtonGroup size="md" isAttached variant="outline" mb={3}>
            <Button
              colorScheme="brand"
              variant={sport === 'cfb' ? 'solid' : 'outline'}
              onClick={() => switchSport('cfb')}
            >
              CFB
            </Button>
            <Button
              colorScheme="brand"
              variant={sport === 'nfl' ? 'solid' : 'outline'}
              onClick={() => switchSport('nfl')}
            >
              NFL
            </Button>
          </ButtonGroup>
          <Text fontSize="lg" color="gray.600">
            {selectedWeek === 'all' 
              ? 'All weeks combined'
              : `Week ${selectedWeek}`
            }
          </Text>
        </Box>

        <HStack spacing={4} flexWrap="wrap" justify="center">
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
          {!isNfl && (
            <>
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
            </>
          )}
        </HStack>

        {!isNfl && championTab ? (
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
        ) : !isNfl && consensusTab ? (
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
            <Spinner size="xl" color="brand.500" />
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} w="full">
            <Box gridColumn={{ lg: 'span 2' }}>
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Top {topN}</Heading>
                </CardHeader>
                <CardBody>
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Rank</Th>
                          <Th>Team</Th>
                          <Th isNumeric>Points</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {rankedTeams.map((team, index) => {
                          let arrow = null
                          if (previousRankings.length > 0) {
                            const prevIndex = previousRankings.findIndex(t => t.team === team.team)
                            if (prevIndex === -1) {
                              arrow = <span title="New" style={{color: 'green'}}>↑</span>
                            } else if (prevIndex > index) {
                              arrow = <span title="Up" style={{color: 'green'}}>↑</span>
                            } else if (prevIndex < index) {
                              arrow = <span title="Down" style={{color: 'red'}}>↓</span>
                            } else {
                              arrow = <span title="Same" style={{color: 'gray'}}>→</span>
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
                            </Tr>
                          )
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                </CardBody>
              </Card>
              {!isNfl && unrankedTeams.length > 0 && (
                <Card bg={cardBg} border="1px" borderColor={borderColor} mt={8}>
                  <CardHeader>
                    <Heading size="sm">Received Votes (Outside Top 25)</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Team</Th>
                            <Th isNumeric>Points</Th>
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

            <Box>
              <Card bg={cardBg} border="1px" borderColor={borderColor} h="fit-content">
                <CardHeader>
                  <Heading size="md">Stats</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Stat>
                      <StatLabel>Voters Per Week</StatLabel>
                      <Box>
                        {weekStats.length === 0 ? (
                          <Text fontSize="sm" color="gray.500">No votes yet</Text>
                        ) : (
                          weekStats.map(w => (
                            <Text key={w.week} fontSize="sm">Week {w.week}: {w.voters} voters</Text>
                          ))
                        )}
                      </Box>
                    </Stat>
                    <Stat>
                      <StatLabel>Teams</StatLabel>
                      <StatNumber>{rankedTeams.length + unrankedTeams.length}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Highest</StatLabel>
                      <StatNumber fontSize="lg">
                        {rankedTeams[0]?.team || 'N/A'}
                      </StatNumber>
                      <StatHelpText>
                        {formatPoints(rankedTeams[0]?.points || 0)} pts
                      </StatHelpText>
                    </Stat>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Scoring
                      </Text>
                      <Text fontSize="xs">
                        {isNfl
                          ? '1st = 32 pts … 32nd = 1 pt'
                          : '1st = 25 pts … 25th = 1 pt'}
                      </Text>
                    </Box>
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
