import { useState, useEffect } from 'react'
import {
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  Select,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Badge,
  useToast,
} from '@chakra-ui/react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1)

export default function NflVote() {
  const [teams, setTeams] = useState([])
  const [rankings, setRankings] = useState([])
  const [week, setWeek] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const toast = useToast()

  useEffect(() => {
    loadTeams()
  }, [])

  useEffect(() => {
    if (!week || teams.length === 0) return
    loadBallotForWeek(week)
  }, [week, teams])

  const loadTeams = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/vote/nfl/teams`)
      setTeams(response.data)
      setRankings(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error loading NFL teams:', err)
      setError('Failed to load NFL teams')
      setLoading(false)
    }
  }

  const loadBallotForWeek = async (selectedWeek) => {
    setMessage('')
    setError('')
    try {
      const response = await axios.get(`${API_URL}/api/vote/nfl/my_votes`, {
        withCredentials: true,
      })
      const ballot = response.data?.[selectedWeek]
      if (ballot?.ranked?.length === 32) {
        const byName = Object.fromEntries(teams.map((t) => [t.name, t]))
        const ordered = ballot.ranked.map((name) => byName[name]).filter(Boolean)
        if (ordered.length === 32) {
          setRankings(ordered)
          return
        }
      }
      setRankings(teams)
    } catch {
      setRankings(teams)
    }
  }

  const moveTeam = (from, to) => {
    if (from === to || from == null || to == null) return
    setRankings((prev) => {
      const items = Array.from(prev)
      const [item] = items.splice(from, 1)
      items.splice(to, 0, item)
      return items
    })
  }

  const onDragStart = (index) => (e) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.6'
    }
  }

  const onDragEnd = (e) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
    setDragIndex(null)
    setOverIndex(null)
  }

  const onDragOver = (index) => (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (overIndex !== index) setOverIndex(index)
  }

  const onDrop = (index) => (e) => {
    e.preventDefault()
    const from = Number(e.dataTransfer.getData('text/plain'))
    moveTeam(from, index)
    setDragIndex(null)
    setOverIndex(null)
  }

  const formatBallotForClipboard = () => {
    let text = `NFL Rankings${week ? ` - Week ${week}` : ''}\n\n`
    rankings.forEach((team, index) => {
      text += `${index + 1}. ${team.name}\n`
    })
    return text
  }

  const copyBallotToClipboard = async () => {
    if (rankings.length === 0) return
    const ballotText = formatBallotForClipboard()
    try {
      await navigator.clipboard.writeText(ballotText)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = ballotText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    toast({
      title: 'Ballot copied',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }

  const submitVote = async () => {
    if (!week) {
      setError('Select a week')
      return
    }
    if (rankings.length !== 32) {
      setError('All 32 teams must be ranked')
      return
    }

    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      await axios.post(
        `${API_URL}/api/vote/nfl/submit_vote`,
        {
          week: parseInt(week, 10),
          rankings: rankings.map((t) => t.name),
        },
        { withCredentials: true }
      )
      setMessage('Ballot submitted')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit ballot')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Center py={12}>
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="xl" textAlign="center">
          NFL Rankings
        </Heading>

        <HStack justify="center" spacing={4}>
          <Select
            maxW="200px"
            placeholder="Week"
            value={week}
            onChange={(e) => {
              setWeek(e.target.value)
              setError('')
            }}
          >
            {WEEKS.map((w) => (
              <option key={w} value={w}>
                Week {w}
              </option>
            ))}
          </Select>
          <Button
            colorScheme="brand"
            onClick={submitVote}
            isLoading={submitting}
            isDisabled={!week || rankings.length !== 32}
          >
            Submit
          </Button>
          <Button
            variant="outline"
            colorScheme="blue"
            onClick={copyBallotToClipboard}
            isDisabled={rankings.length === 0}
          >
            Copy Ballot
          </Button>
        </HStack>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {message && (
          <Alert status="success">
            <AlertIcon />
            {message}
          </Alert>
        )}

        <Card border="1px" borderColor="gray.200">
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rankings.map((team, index) => {
                const isOver = overIndex === index && dragIndex !== index
                return (
                  <div
                    key={team.id}
                    draggable="true"
                    onDragStart={onDragStart(index)}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver(index)}
                    onDrop={onDrop(index)}
                    style={{
                      padding: '12px',
                      background: isOver ? '#ebf8ff' : undefined,
                      border: `1px solid ${isOver ? '#2196f3' : '#E2E8F0'}`,
                      borderRadius: '6px',
                      cursor: 'grab',
                      userSelect: 'none',
                    }}
                  >
                    <HStack justify="space-between">
                      <HStack>
                        <Badge colorScheme="blue" variant="solid" minW="28px" textAlign="center">
                          {index + 1}
                        </Badge>
                        <Text>{team.name}</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Button
                          size="xs"
                          variant="ghost"
                          isDisabled={index === 0}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => moveTeam(index, index - 1)}
                          aria-label="Move up"
                        >
                          ↑
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          isDisabled={index === rankings.length - 1}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => moveTeam(index, index + 1)}
                          aria-label="Move down"
                        >
                          ↓
                        </Button>
                      </HStack>
                    </HStack>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}
