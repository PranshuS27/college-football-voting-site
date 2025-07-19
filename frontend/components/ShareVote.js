import { Box, Typography, Button, Paper } from '@mui/material'

export default function ShareVote({ week, ballot }) {
  const formatText = ballot.map((team, i) => `${i + 1}. ${team}`).join('\\n')
  const copyText = () => {
    const text = `Week ${week} Ballot:\\n${formatText}`
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <Box mt={3}>
      <Typography variant="h6">Your Ballot (Week {week})</Typography>
      <Paper sx={{ whiteSpace: 'pre-wrap', p: 2, mt: 1 }}>
        {formatText.split('\\n').map((line, i) => <div key={i}>{line}</div>)}
      </Paper>
      <Button variant="outlined" onClick={copyText} sx={{ mt: 1 }}>
        Copy to Clipboard
      </Button>
    </Box>
  )
}
