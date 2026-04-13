import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Divider,
  Alert,
  Chip,
} from '@mui/material'
import { Close, Delete, Add } from '@mui/icons-material'

const getCapacityByType = (roomType) => {
  if (roomType === 'double') return 2
  if (roomType === 'quad') return 4
  return 3
}

const toInteger = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.floor(parsed)
}

const rangeToRoomNumbers = (range) => {
  const startNumber = toInteger(range.startNumber)
  const endNumber = toInteger(range.endNumber)

  if (
    !range ||
    !range.roomType ||
    !Number.isInteger(startNumber) ||
    !Number.isInteger(endNumber) ||
    startNumber < 0 ||
    endNumber < startNumber
  ) {
    return []
  }

  const prefix = (range.prefix || '').trim()
  const width = Math.max(String(startNumber).length, String(endNumber).length)
  const output = []

  for (let roomNo = startNumber; roomNo <= endNumber; roomNo += 1) {
    output.push(`${prefix}${String(roomNo).padStart(width, '0')}`)
  }

  return output
}

const createEmptyRange = () => ({
  id: Date.now() + Math.random(),
  prefix: '',
  startNumber: '',
  endNumber: '',
  floorNo: '',
  roomType: 'triple',
})

const getRoomIdMap = (rooms) => {
  const roomIdMap = {}
  for (const room of Array.isArray(rooms) ? rooms : []) {
    if (room?._id && room?.roomNumber) {
      roomIdMap[String(room.roomNumber)] = room._id
    }
  }
  return roomIdMap
}

const blockToFormBlock = (block) => {
  const rooms = Array.isArray(block?.rooms) ? block.rooms : []

  const ranges = rooms.length > 0
    ? rooms.map((room, idx) => {
        const roomNumber = String(room.roomNumber || '').trim()
        const match = roomNumber.match(/^(.*?)(\d+)$/)

        if (match) {
          return {
            id: `${block._id || block.id || 'block'}-${idx}`,
            prefix: match[1],
            startNumber: match[2],
            endNumber: match[2],
            floorNo: '',
            roomType: room.roomType || 'triple',
          }
        }

        return {
          id: `${block._id || block.id || 'block'}-${idx}`,
          prefix: `${roomNumber}-`,
          startNumber: '1',
          endNumber: '1',
          floorNo: '',
          roomType: room.roomType || 'triple',
        }
      })
    : [createEmptyRange()]

  return {
    _id: block?._id,
    id: block?._id || Date.now() + Math.random(),
    name: block?.name || '',
    totalRooms: block?.totalRooms ?? '',
    ranges,
    roomIdMap: getRoomIdMap(rooms),
  }
}

const buildRoomsFromBlockRanges = (block, roomTypePricing = {}) => {
  const generatedRooms = []
  const duplicateRoomNumbers = []
  const roomNumberSet = new Set()

  for (const range of block.ranges || []) {
    const roomNumbers = rangeToRoomNumbers(range)
    const roomType = range.roomType || 'triple'
    const capacity = getCapacityByType(roomType)
    const defaultTypePrice = Number(roomTypePricing[roomType] ?? 0)
    const fallbackTypePrice = Number.isFinite(defaultTypePrice) && defaultTypePrice >= 0 ? defaultTypePrice : 0
    const price = fallbackTypePrice

    for (const roomNumber of roomNumbers) {
      if (roomNumberSet.has(roomNumber)) {
        duplicateRoomNumbers.push(roomNumber)
        continue
      }

      roomNumberSet.add(roomNumber)

      generatedRooms.push({
        _id: block.roomIdMap?.[roomNumber],
        roomNumber,
        roomType,
        capacity,
        price,
      })
    }
  }

  return {
    rooms: generatedRooms,
    generatedCount: generatedRooms.length,
    duplicateRoomNumbers,
  }
}

function HostelFormDialog({ open, onClose, onSubmit, initialData = null, loading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    blocks: [],
    roomTypePricing: {
      double: 0,
      triple: 0,
      quad: 0,
    },
  })
  const [formError, setFormError] = useState('')
  const [rangeFilters, setRangeFilters] = useState({
    blockId: 'all',
    roomQuery: '',
    floorNo: 'all',
    roomType: 'all',
  })

  // Set the form state when the dialog opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          type: initialData.type || '',
          blocks: Array.isArray(initialData.blocks)
            ? initialData.blocks.map((block) => blockToFormBlock(block))
            : [],
          roomTypePricing: initialData.roomTypePricing || {
            double: 0,
            triple: 0,
            quad: 0,
          },
        })
      } else {
        setFormData({
          name: '',
          type: '',
          blocks: [],
          roomTypePricing: {
            double: 0,
            triple: 0,
            quad: 0,
          },
        })
      }
      setFormError('')
      setRangeFilters({
        blockId: 'all',
        roomQuery: '',
        floorNo: 'all',
        roomType: 'all',
      })
    }
  }, [open, initialData])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddBlock = () => {
    setFormData((prev) => ({
      ...prev,
      blocks: [
        ...prev.blocks,
        {
          id: Date.now() + Math.random(),
          name: '',
          totalRooms: '',
          ranges: [createEmptyRange()],
          roomIdMap: {},
        },
      ],
    }))
  }

  const handleBlockChange = (index, field, value) => {
    const updatedBlocks = [...formData.blocks]
    updatedBlocks[index][field] = value
    setFormData({ ...formData, blocks: updatedBlocks })
  }

  const handleRemoveBlock = (index) => {
    const updatedBlocks = formData.blocks.filter((_, i) => i !== index)
    setFormData({ ...formData, blocks: updatedBlocks })
  }

  const handleAddRange = (blockIndex) => {
    const updatedBlocks = [...formData.blocks]
    const block = updatedBlocks[blockIndex]
    block.ranges = [...(block.ranges || []), createEmptyRange()]
    setFormData({ ...formData, blocks: updatedBlocks })
  }

  const handleRangeChange = (blockIndex, rangeIndex, field, value) => {
    const updatedBlocks = [...formData.blocks]
    updatedBlocks[blockIndex].ranges[rangeIndex][field] = value
    setFormData({ ...formData, blocks: updatedBlocks })
  }

  const handleRemoveRange = (blockIndex, rangeIndex) => {
    const updatedBlocks = [...formData.blocks]
    const nextRanges = updatedBlocks[blockIndex].ranges.filter((_, idx) => idx !== rangeIndex)
    updatedBlocks[blockIndex].ranges = nextRanges.length > 0 ? nextRanges : [createEmptyRange()]
    setFormData({ ...formData, blocks: updatedBlocks })
  }

  const handleRoomTypePricingChange = (roomType, price) => {
    const parsedPrice = Number(price)
    const validPrice = Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0
    setFormData((prev) => ({
      ...prev,
      roomTypePricing: {
        ...prev.roomTypePricing,
        [roomType]: validPrice,
      },
    }))
  }

  const getBlockFilterValue = (block, index) => String(block?._id || block?.id || index)

  const handleRangeFilterChange = (field, value) => {
    setRangeFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const getFloorOptions = () => {
    const floorSet = new Set()

    for (const block of formData.blocks || []) {
      for (const range of block.ranges || []) {
        const floor = String(range.floorNo || '').trim()
        if (floor) floorSet.add(floor)
      }
    }

    return Array.from(floorSet).sort((a, b) => Number(a) - Number(b))
  }

  const getFilteredRanges = (block, blockIndex) => {
    const selectedBlockId = rangeFilters.blockId || 'all'
    const selectedRoomType = rangeFilters.roomType || 'all'
    const selectedFloorNo = rangeFilters.floorNo || 'all'
    const roomQuery = (rangeFilters.roomQuery || '').trim().toLowerCase()
    const blockFilterValue = getBlockFilterValue(block, blockIndex)

    if (selectedBlockId !== 'all' && selectedBlockId !== blockFilterValue) {
      return []
    }

    return (block.ranges || []).filter((range) => {
      const rangeRoomType = range.roomType || 'triple'
      const rangeFloorNo = String(range.floorNo || '').trim()

      if (selectedRoomType !== 'all' && rangeRoomType !== selectedRoomType) return false
      if (selectedFloorNo !== 'all' && rangeFloorNo !== selectedFloorNo) return false

      if (!roomQuery) return true

      const prefix = String(range.prefix || '').toLowerCase()
      if (prefix.includes(roomQuery)) return true

      const roomNumbers = rangeToRoomNumbers(range)
      return roomNumbers.some((roomNo) => String(roomNo).toLowerCase().includes(roomQuery))
    })
  }

  const getBlockMetrics = (block) => {
    const totalRooms = Number(block.totalRooms || 0)
    const { generatedCount, duplicateRoomNumbers } = buildRoomsFromBlockRanges(block, formData.roomTypePricing)
    return {
      totalRooms,
      generatedCount,
      remaining: totalRooms - generatedCount,
      duplicateRoomNumbers,
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    setFormError('')

    if (!formData.name || !formData.type) {
      setFormError('Please fill the hostel name and type.')
      return
    }

    const globalRoomSet = new Set()

    const processedBlocks = formData.blocks.map((block) => {
      const totalRooms = Number(block.totalRooms || 0)
      const { rooms, generatedCount, duplicateRoomNumbers } = buildRoomsFromBlockRanges(block, formData.roomTypePricing)

      return {
        ...block,
        totalRooms,
        rooms,
        generatedCount,
        duplicateRoomNumbers,
        remaining: totalRooms - generatedCount,
      }
    })

    for (const block of processedBlocks) {
      if (!block.name?.trim()) {
        setFormError('Every block must have a name.')
        return
      }

      if (!Number.isInteger(block.totalRooms) || block.totalRooms < 0) {
        setFormError(`Block \"${block.name || 'Unnamed'}\" must have a valid total room count.`)
        return
      }

      if (block.duplicateRoomNumbers.length > 0) {
        setFormError(
          `Block \"${block.name || 'Unnamed'}\" has duplicate room numbers: ${[
            ...new Set(block.duplicateRoomNumbers),
          ].join(', ')}`
        )
        return
      }

      if (block.remaining !== 0) {
        const actionText =
          block.remaining > 0
            ? `Add ${block.remaining} more room${block.remaining === 1 ? '' : 's'}`
            : `Remove ${Math.abs(block.remaining)} room${Math.abs(block.remaining) === 1 ? '' : 's'}`

        setFormError(
          `Block \"${block.name || 'Unnamed'}\" requires exactly ${block.totalRooms} rooms. Generated ${block.generatedCount}. ${actionText}.`
        )
        return
      }

      for (const room of block.rooms) {
        if (globalRoomSet.has(room.roomNumber)) {
          setFormError(`Duplicate room number \"${room.roomNumber}\" is not allowed across blocks.`)
          return
        }
        globalRoomSet.add(room.roomNumber)
      }
    }

    onSubmit({
      ...formData,
      blocks: processedBlocks.map((block) => ({
        _id: block._id,
        name: block.name,
        totalRooms: block.totalRooms,
        rooms: block.rooms,
      })),
      roomTypePricing: formData.roomTypePricing,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {initialData ? 'Edit Hostel' : 'Create New Hostel'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label="Hostel Name"
            variant="outlined"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Sunrise Boys Hostel"
          />

          <FormControl fullWidth required>
            <InputLabel>Hostel Type</InputLabel>
            <Select
              label="Hostel Type"
              value={formData.type}
              disabled
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <MenuItem value="boy">Boys</MenuItem>
              <MenuItem value="girl">Girls</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Default Room Type Pricing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set default prices for each room type. All generated rooms of that type will use this pricing.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2,
              mb: 2.5,
            }}
          >
            {['double', 'triple', 'quad'].map((roomType) => {
              const roomTypeName = roomType.charAt(0).toUpperCase() + roomType.slice(1)
              const capacity =
                roomType === 'double' ? 2 : roomType === 'quad' ? 4 : 3

              return (
                <Box
                  key={roomType}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.02)'
                        : '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor:
                          roomType === 'double'
                            ? 'rgba(59, 130, 246, 0.1)'
                            : roomType === 'triple'
                              ? 'rgba(34, 197, 94, 0.1)'
                              : 'rgba(168, 85, 247, 0.1)',
                        color:
                          roomType === 'double'
                            ? '#3b82f6'
                            : roomType === 'triple'
                              ? '#22c55e'
                              : '#a855f7',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      {roomTypeName}
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 'auto' }}
                    >
                      {capacity} beds
                    </Typography>
                  </Box>

                  <TextField
                    label="Default Price"
                    type="number"
                    size="small"
                    value={formData.roomTypePricing[roomType] || 0}
                    onChange={(e) =>
                      handleRoomTypePricingChange(roomType, e.target.value)
                    }
                    inputProps={{ min: 0 }}
                    placeholder="0"
                  />
                </Box>
              )
            })}
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>
              Blocks
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={handleAddBlock}
              sx={{ borderRadius: 2 }}
            >
              Add Block
            </Button>
          </Box>

          {formData.blocks.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 1.5,
              }}
            >
              <FormControl size="small" fullWidth>
                <InputLabel>Filter Block</InputLabel>
                <Select
                  label="Filter Block"
                  value={rangeFilters.blockId}
                  onChange={(e) => handleRangeFilterChange('blockId', e.target.value)}
                >
                  <MenuItem value="all">All Blocks</MenuItem>
                  {formData.blocks.map((block, index) => (
                    <MenuItem key={getBlockFilterValue(block, index)} value={getBlockFilterValue(block, index)}>
                      {block.name?.trim() || `Block ${index + 1}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Prefix / Room No"
                value={rangeFilters.roomQuery}
                onChange={(e) => handleRangeFilterChange('roomQuery', e.target.value)}
                placeholder="e.g. A-10"
                fullWidth
              />

              <FormControl size="small" fullWidth>
                <InputLabel>Filter Floor</InputLabel>
                <Select
                  label="Filter Floor"
                  value={rangeFilters.floorNo}
                  onChange={(e) => handleRangeFilterChange('floorNo', e.target.value)}
                >
                  <MenuItem value="all">All Floors</MenuItem>
                  {getFloorOptions().map((floor) => (
                    <MenuItem key={floor} value={floor}>
                      Floor {floor}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Filter Type</InputLabel>
                <Select
                  label="Filter Type"
                  value={rangeFilters.roomType}
                  onChange={(e) => handleRangeFilterChange('roomType', e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="double">Double</MenuItem>
                  <MenuItem value="triple">Triple</MenuItem>
                  <MenuItem value="quad">Quad</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {formData.blocks.map((block, index) => (
            <Box
              key={block._id || block.id || index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: 2,
                borderRadius: 2,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
                <TextField
                  label="Block Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  required
                  value={block.name}
                  onChange={(e) => handleBlockChange(index, 'name', e.target.value)}
                  placeholder="e.g. Block A"
                />
                <TextField
                  label="Total Rooms"
                  variant="outlined"
                  size="small"
                  type="number"
                  fullWidth
                  required
                  value={block.totalRooms}
                  onChange={(e) => handleBlockChange(index, 'totalRooms', e.target.value)}
                  inputProps={{ min: 0 }}
                />
                <IconButton onClick={() => handleRemoveBlock(index)} color="error" size="small">
                  <Delete />
                </IconButton>
              </Box>

              <Box sx={{ width: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Room Ranges
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => handleAddRange(index)}
                  >
                    Add Range
                  </Button>
                </Box>

                {(block.ranges || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    No ranges created. Click "Add Range" to start.
                  </Typography>
                ) : getFilteredRanges(block, index).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    No ranges match your filter.
                  </Typography>
                ) : (
                  getFilteredRanges(block, index).map((range) => {
                    const previewRooms = rangeToRoomNumbers(range)
                    const actualRangeIndex = (block.ranges || []).findIndex(
                      (r) => r.id === range.id
                    )
                    return (
                    <Box
                      key={range.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '2fr 10fr', md: '1fr 1fr 1fr 1fr 1fr auto' },
                        gap: 1,
                        alignItems: 'start',
                        mb: 1.5,
                        p: 1,
                        borderRadius: 1.5,
                        border: (theme) => `1px dashed ${theme.palette.divider}`,
                      }}
                    >
                      <TextField
                        label="Prefix"
                        size="small"
                        value={range.prefix}
                        onChange={(e) => handleRangeChange(index, actualRangeIndex, 'prefix', e.target.value)}
                        placeholder="A-"
                      />
                      <TextField
                        label="Start"
                        size="small"
                        type="number"
                        value={range.startNumber}
                        onChange={(e) => handleRangeChange(index, actualRangeIndex, 'startNumber', e.target.value)}
                      />
                      <TextField
                        label="End"
                        size="small"
                        type="number"
                        value={range.endNumber}
                        onChange={(e) => handleRangeChange(index, actualRangeIndex, 'endNumber', e.target.value)}
                      />
                      <TextField
                        label="Floor No"
                        size="small"
                        type="number"
                        value={range.floorNo}
                        onChange={(e) => handleRangeChange(index, actualRangeIndex, 'floorNo', e.target.value)}
                      />
                      <FormControl size="small" fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          label="Type"
                          value={range.roomType}
                          onChange={(e) => handleRangeChange(index, actualRangeIndex, 'roomType', e.target.value)}
                        >
                          <MenuItem value="double">Double</MenuItem>
                          <MenuItem value="triple">Triple</MenuItem>
                          <MenuItem value="quad">Quad</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton
                        onClick={() => handleRemoveRange(index, actualRangeIndex)}
                        color="error"
                        size="small"
                        sx={{ mt: 0.5 }}
                      >
                        <Delete />
                      </IconButton>

                      <Box sx={{ gridColumn: '1 / -1' }}>
                        <Typography variant="caption" color="text.secondary">
                          Preview: {previewRooms.slice(0, 8).join(', ')}
                          {previewRooms.length > 8 ? ` +${previewRooms.length - 8} more` : ''}
                          {previewRooms.length === 0 ? ' Fill start/end/type to generate rooms.' : ''}
                        </Typography>
                      </Box>
                    </Box>
                  )
                }))}

                {(() => {
                  const { totalRooms, generatedCount, remaining, duplicateRoomNumbers } = getBlockMetrics(block)
                  const color = remaining === 0 && duplicateRoomNumbers.length === 0 ? 'success' : 'warning'

                  return (
                    <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                      <Chip size="small" label={`Generated: ${generatedCount}`} color="default" />
                      <Chip size="small" label={`Target: ${totalRooms || 0}`} color="default" />
                      <Chip
                        size="small"
                        color={color}
                        label={
                          remaining === 0
                            ? 'Room count matched'
                            : remaining > 0
                              ? `Add ${remaining} room${remaining === 1 ? '' : 's'}`
                              : `Remove ${Math.abs(remaining)} room${Math.abs(remaining) === 1 ? '' : 's'}`
                        }
                      />
                      {duplicateRoomNumbers.length > 0 && (
                        <Chip
                          size="small"
                          color="error"
                          label={`Duplicate rooms: ${[...new Set(duplicateRoomNumbers)].slice(0, 3).join(', ')}${
                            duplicateRoomNumbers.length > 3 ? '...' : ''
                          }`}
                        />
                      )}
                    </Box>
                  )
                })()}
              </Box>
            </Box>
          ))}
          {formData.blocks.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No blocks added. You can add them later.
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            disableElevation
            sx={{ fontWeight: 600, borderRadius: 2, px: 3 }}
          >
            {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Hostel'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default HostelFormDialog








