import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert, Box, Button, Card, Chip, CircularProgress,
  Divider, MenuItem, Snackbar, TextField, ToggleButton,
  ToggleButtonGroup, Typography,
} from '@mui/material'
import {
  CloudUpload, Shield, Bolt, History, ArrowForwardIos,
  ReportProblemOutlined, CheckCircle, Cancel, Schedule,
} from '@mui/icons-material'
import HighlightMatch from '../components/HighlightMatch.jsx'
import api from '../api/api'

const CATEGORIES = [
  'Plumbing', 'Electrical', 'Furniture', 'Cleanliness',
  'Wi-Fi / Internet', 'AC / Heating', 'Security', 'Other',
]

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'warning', icon: Schedule },
  in_progress: { label: 'In Progress', color: 'info',    icon: ReportProblemOutlined },
  resolved:    { label: 'Resolved',    color: 'success', icon: CheckCircle },
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// ── Complaint list item ────────────────────────────────────────────────────────
function ComplaintRow({ complaint, query = '' }) {
  const cfg = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <Box sx={{
      p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 2, flexWrap: 'wrap',
      '&:hover': { bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc' },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1, minWidth: 0 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0, mt: 0.2,
          bgcolor: complaint.status === 'resolved' ? '#dcfce7' : complaint.status === 'in_progress' ? '#e0f2fe' : '#fef3c7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon sx={{
            fontSize: 17,
            color: complaint.status === 'resolved' ? '#16a34a' : complaint.status === 'in_progress' ? '#0891b2' : '#d97706',
          }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={600} fontSize={14} color="text.primary" noWrap>
            <HighlightMatch text={complaint.description?.slice(0, 60) || 'Complaint'} query={query} />
            {complaint.description?.length > 60 ? '…' : ''}
          </Typography>
          <Typography fontSize={12} color="text.secondary" mt={0.3}>
            <HighlightMatch text={complaint.category || 'General'} query={query} /> · {formatTime(complaint.createdAt)}
          </Typography>
        </Box>
      </Box>
      <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 700, fontSize: 11 }} />
    </Box>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StudentComplaints({ searchQuery = '' }) {
  const [view, setView] = useState('new') // 'new' | 'list'
  const [form, setForm] = useState({ category: '', urgency: 'normal', title: '', description: '' })
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [complaints, setComplaints] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [hostelId, setHostelId] = useState(null)
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })
  const fileRef = useRef()

  const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity })

  // Fetch student's hostelId for complaint creation
  useEffect(() => {
    api.get('/user/student/dashboard')
      .then((r) => setHostelId(r.data?.data?.room?.hostelId || null))
      .catch(() => {})
  }, [])

  // Fetch existing complaints
  useEffect(() => {
    if (view === 'list') {
      setLoadingList(true)
      api.get('/complaints')
        .then((r) => setComplaints(r.data?.data || []))
        .catch(() => notify('Failed to load complaints.', 'error'))
        .finally(() => setLoadingList(false))
    }
  }, [view])

  const filteredComplaints = useMemo(() => {
    if (!searchQuery.trim()) {
      return complaints
    }

    const q = searchQuery.toLowerCase()
    return complaints.filter((complaint) => [
      complaint.title,
      complaint.description,
      complaint.category,
      complaint.status,
      complaint.urgency,
    ].some((field) => String(field || '').toLowerCase().includes(q)))
  }, [complaints, searchQuery])

  const handleField = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files || []).slice(0, 5)
    setFiles(picked)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files || []).slice(0, 5)
    setFiles(dropped)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category) { notify('Please select a category.', 'error'); return }
    if (!form.description.trim()) { notify('Please describe the problem.', 'error'); return }

    setSubmitting(true)
    try {
      await api.post('/complaints', {
        description: form.description,
        category: form.category,
        title: form.title,
        urgency: form.urgency,
        hostelId: hostelId || undefined,
      })
      setForm({ category: '', urgency: 'normal', title: '', description: '' })
      setFiles([])
      notify('Complaint filed successfully! We will look into it.', 'success')
      setView('list')
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to file complaint.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', width: '100%' }}>
      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Typography
          fontSize={14} color={view === 'list' ? 'primary.main' : 'text.secondary'}
          sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
          onClick={() => setView('list')}
        >
          Complaints
        </Typography>
        {view === 'new' && (
          <>
            <ArrowForwardIos sx={{ fontSize: 11, color: 'text.disabled' }} />
            <Typography fontSize={14} color="text.primary" fontWeight={600}>Raise New</Typography>
          </>
        )}
        <Box sx={{ flex: 1 }} />
        {view === 'list' ? (
          <Button variant="contained" size="small" onClick={() => setView('new')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
            + Raise Complaint
          </Button>
        ) : null}
      </Box>

      {view === 'new' ? (
        /* ── New complaint form ─────────────────────────────────────────── */
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="text.primary">Raise a New Complaint</Typography>
            <Typography fontSize={14} color="text.secondary" mt={0.5}>
              Please provide accurate details to help our maintenance team resolve the issue faster.
            </Typography>
          </Box>

          <Card sx={{ p: 3.5, border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Category + Urgency */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={1}>
                  What is the issue related to?
                </Typography>
                <TextField select fullWidth value={form.category} onChange={handleField('category')}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                  <MenuItem value=""><em>Select Category</em></MenuItem>
                  {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Box>

              <Box sx={{ minWidth: 180 }}>
                <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={1}>Urgency Level</Typography>
                <ToggleButtonGroup
                  exclusive value={form.urgency} onChange={(_, v) => v && setForm((p) => ({ ...p, urgency: v }))}
                  sx={{ height: 56 }}
                >
                  <ToggleButton value="normal" sx={{
                    borderRadius: '8px 0 0 8px !important', fontWeight: 600, fontSize: 14, px: 2.5,
                    '&.Mui-selected': { color: 'primary.main', borderColor: 'primary.main', bgcolor: 'rgba(47,97,255,0.06)' },
                  }}>
                    Normal
                  </ToggleButton>
                  <ToggleButton value="urgent" sx={{
                    borderRadius: '0 8px 8px 0 !important', fontWeight: 600, fontSize: 14, px: 2.5,
                    '&.Mui-selected': { color: 'error.main', borderColor: 'error.main', bgcolor: 'rgba(239,68,68,0.06)' },
                  }}>
                    Urgent
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>

            {/* Title */}
            <Box>
              <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={1}>Brief Title</Typography>
              <TextField fullWidth value={form.title} onChange={handleField('title')}
                placeholder="e.g., Leaking Tap in Room 302 Bathroom"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>

            {/* Description */}
            <Box>
              <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={1}>Describe the problem in detail</Typography>
              <TextField fullWidth multiline rows={5} value={form.description} onChange={handleField('description')}
                placeholder="Please provide more information about the issue. Include when it started and any specific details that might help us fix it."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>

           

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
              <Button variant="text" color="inherit" onClick={() => setView('list')}
                sx={{ fontWeight: 600, textTransform: 'none', color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" fullWidth disabled={submitting}
                endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIos sx={{ fontSize: '14px !important' }} />}
                sx={{
                  borderRadius: 2, fontWeight: 700, py: 1.5, fontSize: 15, textTransform: 'none',
                  background: 'linear-gradient(90deg, #2f61ff 0%, #1e40af 100%)',
                  '&:hover': { background: 'linear-gradient(90deg, #1e4fdb 0%, #1a369a 100%)' },
                }}>
                {submitting ? 'Filing…' : 'File Complaint'}
              </Button>
            </Box>
          </Card>

          {/* Features footer */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', pt: 1 }}>
            {[
              { icon: Shield, color: '#2563eb', bg: '#eff6ff', title: 'Trackable', desc: 'Get real-time updates on your complaint status.' },
              { icon: Bolt, color: '#d97706', bg: '#fef3c7', title: 'Priority Support', desc: 'Electrical and water issues are handled on priority.' },
              { icon: History, color: '#7c3aed', bg: '#ede9fe', title: 'Resolution History', desc: 'View past complaints and their resolutions anytime.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <Box key={title} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: '1 1 200px', maxWidth: 280 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon sx={{ fontSize: 18, color }} />
                </Box>
                <Box>
                  <Typography fontWeight={700} fontSize={14}>{title}</Typography>
                  <Typography fontSize={12} color="text.secondary" mt={0.2}>{desc}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        /* ── My complaints list ─────────────────────────────────────────── */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="text.primary">My Complaints</Typography>
            <Typography fontSize={14} color="text.secondary" mt={0.5}>
              Track the status of all your submitted complaints.
            </Typography>
          </Box>

          {loadingList ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : filteredComplaints.length === 0 ? (
            <Card sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <ReportProblemOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography fontWeight={600} color="text.secondary">
                {searchQuery.trim() ? 'No matching complaints found' : 'No complaints found'}
              </Typography>
              <Typography fontSize={13} color="text.secondary" mt={0.5}>
                {searchQuery.trim() ? 'Try a different search term.' : 'You have not filed any complaints yet.'}
              </Typography>
            </Card>
          ) : (
            <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {filteredComplaints.map((c) => <ComplaintRow key={c._id} complaint={c} query={searchQuery} />)}
            </Card>
          )}
        </Box>
      )}

      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled"
          onClose={() => setSnack((p) => ({ ...p, open: false }))} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}