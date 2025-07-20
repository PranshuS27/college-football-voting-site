import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
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
  Select,
  Alert,
  AlertIcon,
  useColorModeValue,
  Spinner,
  Center,
  Badge,
  Divider,
  useToast
} from '@chakra-ui/react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function Vote() {
  const [teams, setTeams] = useState([])
  const [selectedTeams, setSelectedTeams] = useState([])
  const [week, setWeek] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const toast = useToast()

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/vote/teams`)
      setTeams(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading teams:', error)
      setError('Failed to load teams')
      setLoading(false)
    }
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(selectedTeams)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSelectedTeams(items)
  }

  const addTeam = (team) => {
    if (selectedTeams.length >= 25) return
    if (selectedTeams.find(t => t.id === team.id)) return
    setSelectedTeams([...selectedTeams, team])
  }

  const removeTeam = (teamId) => {
    setSelectedTeams(selectedTeams.filter(t => t.id !== teamId))
  }

  const copyBallotToClipboard = async () => {
    if (selectedTeams.length === 0) {
      toast({
        title: "No ballot to copy",
        description: "Please add teams to your ballot first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const ballotText = formatBallotForClipboard()
    
    try {
      await navigator.clipboard.writeText(ballotText)
      toast({
        title: "Ballot copied!",
        description: "Your ballot has been copied to clipboard",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = ballotText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      toast({
        title: "Ballot copied!",
        description: "Your ballot has been copied to clipboard",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const formatBallotForClipboard = () => {
    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString()
    
    let ballotText = `College Football Top 25 Ballot - Week ${week}\n`
    ballotText += `${date} at ${time}\n\n`
    
    selectedTeams.forEach((team, index) => {
      ballotText += `${index + 1}. ${team.name}\n`
    })
    
    ballotText += `\nTotal teams: ${selectedTeams.length}/25`
    
    if (selectedTeams.length < 25) {
      ballotText += ` (${25 - selectedTeams.length} more needed)`
    }
    
    return ballotText
  }

  const submitVote = async () => {
    if (selectedTeams.length !== 25) {
      setError('Please select exactly 25 teams')
      return
    }

    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      await axios.post(`${API_URL}/api/vote/submit_vote`, {
        week: week,
        rankings: selectedTeams.map(t => t.name)
      }, { withCredentials: true })

      setMessage('Vote submitted successfully!')
      setSelectedTeams([])
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit vote')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading teams...</Text>
        </VStack>
      </Center>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="2xl" mb={2}>
            Submit Your Vote
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Drag and drop teams to create your Top 25 rankings
          </Text>
        </Box>

        <HStack spacing={4} align="start">
          <Select 
            value={week} 
            onChange={(e) => setWeek(parseInt(e.target.value))}
            maxW="200px"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(w => (
              <option key={w} value={w}>Week {w}</option>
            ))}
          </Select>
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

        <Box w="full">
          <HStack spacing={8} align="start">
            {/* Available Teams */}
            <Card bg={cardBg} border="1px" borderColor={borderColor} flex={1}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Available Teams</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Click to add teams to your ballot ({selectedTeams.length}/25)
                  </Text>
                  <Box maxH="600px" overflowY="auto">
                    <VStack spacing={2} align="stretch">
                      {teams
                        .filter(team => !selectedTeams.find(t => t.id === team.id))
                        .map(team => (
                          <Box
                            key={team.id}
                            p={3}
                            border="1px"
                            borderColor={borderColor}
                            borderRadius="md"
                            cursor="pointer"
                            _hover={{ bg: 'gray.50' }}
                            onClick={() => addTeam(team)}
                          >
                            <Text>{team.name}</Text>
                          </Box>
        ))}
                    </VStack>
      </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Selected Teams */}
            <Card bg={cardBg} border="1px" borderColor={borderColor} flex={1}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md">Your Top 25</Heading>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      onClick={copyBallotToClipboard}
                      isDisabled={selectedTeams.length === 0}
                    >
                      Copy Ballot
                    </Button>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Drag to reorder, click to remove
                  </Text>
                  
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="selected-teams">
            {(provided) => (
                        <Box
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          minH="400px"
                          border="2px dashed"
                          borderColor={selectedTeams.length === 0 ? 'gray.300' : 'transparent'}
                          borderRadius="md"
                          p={2}
                        >
                          {selectedTeams.map((team, index) => (
                            <Draggable key={team.id} draggableId={team.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                                  p={3}
                                  mb={2}
                                  bg={snapshot.isDragging ? 'blue.50' : cardBg}
                                  border="1px"
                                  borderColor={borderColor}
                                  borderRadius="md"
                                  cursor="pointer"
                                  _hover={{ bg: 'red.50' }}
                                  onClick={() => removeTeam(team.id)}
                                >
                                  <HStack justify="space-between">
                                    <HStack>
                                      <Badge colorScheme="blue" variant="solid">
                                        {index + 1}
                                      </Badge>
                                      <Text>{team.name}</Text>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.500">
                                      Click to remove
                                    </Text>
                                  </HStack>
                                </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
                </VStack>
              </CardBody>
            </Card>
          </HStack>
        </Box>

        <VStack spacing={4}>
          <Button
            colorScheme="brand"
            size="lg"
            onClick={submitVote}
            isLoading={submitting}
            isDisabled={selectedTeams.length !== 25}
          >
            Submit Vote for Week {week}
        </Button>

          {selectedTeams.length > 0 && selectedTeams.length < 25 && (
            <Text fontSize="sm" color="gray.600">
              Need {25 - selectedTeams.length} more teams to submit your vote
            </Text>
          )}
        </VStack>
      </VStack>
    </Container>
  )
}
