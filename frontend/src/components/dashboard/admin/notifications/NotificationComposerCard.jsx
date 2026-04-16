import { Box, Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { Send } from '@mui/icons-material'
import DashboardCard from '../../DashboardCard.jsx'

const audienceOptions = [
  { value: 'students', label: 'Students' },
  { value: 'warden', label: 'Warden' },
  { value: 'both', label: 'Both' },
]

function NotificationComposerCard({ form, sending, onChange, onSubmit }) {
  return (
    <DashboardCard contentSx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
      <Stack spacing={{ xs: 1.75, sm: 2.25 }}>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            Send Notification
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose who should receive the message and send it in one click.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 220px' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <TextField
            label="Title"
            value={form.title}
            onChange={(event) => onChange('title', event.target.value)}
            placeholder="Example: Hostel gate timing update"
            fullWidth
          />

          <TextField
            select
            label="Send To"
            value={form.audience}
            onChange={(event) => onChange('audience', event.target.value)}
            fullWidth
          >
            {audienceOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          label="Message"
          value={form.message}
          onChange={(event) => onChange('message', event.target.value)}
          placeholder="Write the notification message here"
          fullWidth
          multiline
          minRows={6}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip size="small" label="Student notifications" />
          <Chip size="small" label="Warden notifications" />
          <Chip size="small" label="Broadcast only once" />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={onSubmit}
            disabled={sending}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: 0, sm: 200 },
              borderRadius: 2,
              py: 1.1,
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            {sending ? 'Sending...' : 'Send Notification'}
          </Button>
        </Box>
      </Stack>
    </DashboardCard>
  )
}

export default NotificationComposerCard
