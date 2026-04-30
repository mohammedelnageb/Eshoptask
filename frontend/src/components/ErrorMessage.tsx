import { Alert, AlertProps } from '@mui/material'

interface ErrorMessageProps extends AlertProps {
  message: string | null | undefined
}

export default function ErrorMessage({ message, ...props }: ErrorMessageProps) {
  if (!message) return null

  return (
    <Alert severity="error" {...props}>
      {message}
    </Alert>
  )
}
