import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Email } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setValidationError('El email es requerido');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('El email no es válido');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // En desarrollo, mostrar el token en consola
        console.log('🔑 Token de recuperación enviado a:', email);
        console.log('📧 En producción, se enviaría un email con el enlace');
      } else {
        setError(data.message || 'Error al solicitar el reset de contraseña');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationError) {
      setValidationError(null);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              ¡Email enviado!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Si el email existe en nuestra base de datos, hemos enviado un enlace de recuperación.
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Nota de desarrollo:</strong> En producción, recibirías un email. 
              Por ahora, revisa la consola del navegador para ver el token.
            </Alert>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{ px: 4, py: 1.5 }}
            >
              Volver al Login
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              sx={{ px: 4, py: 1.5 }}
            >
              Enviar otro email
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            ¿Olvidaste tu contraseña?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            error={!!validationError}
            helperText={validationError}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ 
              py: 1.5, 
              mb: 3,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </Button>
          
          {isLoading && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </form>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            ¿Recordaste tu contraseña?{' '}
            <RouterLink to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Typography component="span" color="primary.main" sx={{ fontWeight: 'bold' }}>
                Inicia sesión
              </Typography>
            </RouterLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;

