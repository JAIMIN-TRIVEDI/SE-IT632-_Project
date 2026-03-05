import { TextField, InputAdornment, IconButton, Box, Typography } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  showPassword = false,
  onTogglePassword,
  fullWidth = true,
  size = 'medium',
  variant = 'outlined',
  required = false,
  error = false,
  helperText = '',
}) {
  const isPasswordField = type === 'password'

  return (
    <Box>
      {label && (
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
      )}
      <TextField
        fullWidth={fullWidth}
        name={name}
        type={isPasswordField ? (showPassword ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        variant={variant}
        size={size}
        error={error}
        helperText={helperText}
        InputProps={{
          startAdornment: icon && (
            <InputAdornment position="start">
              <Box sx={{ color: 'action.disabled', display: 'flex' }}>{icon}</Box>
            </InputAdornment>
          ),
          endAdornment: isPasswordField && (
            <InputAdornment position="end">
              <IconButton
                onClick={onTogglePassword}
                edge="end"
                sx={{ color: 'text.secondary' }}
              >
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />
    </Box>
  )
}

export default FormInput
