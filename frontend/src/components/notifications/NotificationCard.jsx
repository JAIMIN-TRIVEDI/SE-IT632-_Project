import { Box, Typography } from '@mui/material'
import {
  CreditCard, Restaurant, Settings, Info, Warning, Chat,
} from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import HighlightMatch from '../HighlightMatch.jsx'

// ── Icon / colour mapping by notification type ─────────────────────────────────
export function getNotifStyle(type) {
  const t = (type || '').toLowerCase()
  if (t.includes('payment') || t.includes('rent') || t.includes('fee') || t.includes('invoice'))
    return { icon: CreditCard, color: '#16a34a', bg: '#dcfce7' }
  if (t.includes('mess') || t.includes('menu') || t.includes('food'))
    return { icon: Restaurant, color: '#d97706', bg: '#fef3c7' }
  if (t.includes('maintenance') || t.includes('wifi') || t.includes('system') || t.includes('alert'))
    return { icon: Settings, color: '#0891b2', bg: '#e0f2fe' }
  if (t.includes('warn') || t.includes('complaint'))
    return { icon: Warning, color: '#dc2626', bg: '#fee2e2' }
  if (t.includes('message') || t.includes('feedback') || t.includes('request'))
    return { icon: Chat, color: '#7c3aed', bg: '#ede9fe' }
  return { icon: Info, color: '#64748b', bg: '#f1f5f9' }
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Single notification card ───────────────────────────────────────────────────
function NotificationCard({ notif, onMarkRead, query = '', isClickable = true }) {
  const { icon: Icon, color, bg } = getNotifStyle(notif.type || notif.message)
  const isUnread = !notif.isRead
  const timeStr = formatRelativeTime(notif.createdAt)

  return (
    <Box
      sx={{
        p: 2.5, borderRadius: 2, position: 'relative',
        bgcolor: isUnread
          ? (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff'
          : 'transparent',
        border: isUnread ? '1px solid' : '1px solid transparent',
        borderColor: isUnread ? 'divider' : 'transparent',
        opacity: isUnread ? 1 : 0.65,
        transition: 'all 0.15s',
        '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.04), opacity: 1 },
        cursor: (isUnread && isClickable) ? 'pointer' : 'default',
      }}
      onClick={() => isUnread && isClickable && onMarkRead && onMarkRead(notif._id)}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        {/* Icon */}
        <Box sx={{
          width: 42, height: 42, borderRadius: '50%', bgcolor: bg, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon sx={{ fontSize: 20, color }} />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Typography fontWeight={isUnread ? 700 : 600} fontSize={14} color="text.primary">
              <HighlightMatch
                text={notif.type
                  ? notif.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                  : 'Notification'}
                query={query}
              />
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Typography fontSize={12} color="text.secondary" whiteSpace="nowrap">{timeStr}</Typography>
              {isUnread && (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
              )}
            </Box>
          </Box>
          <Typography fontSize={13} color="text.secondary" mt={0.4} lineHeight={1.6}>
            <HighlightMatch text={notif.message} query={query} />
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default NotificationCard
