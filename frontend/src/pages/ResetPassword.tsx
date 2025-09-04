import React, { useState, useEffect } from 'react';
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
import { Visibility, VisibilityOff, Lock, LockOutlined } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`/api/password-reset/verify/${token}`);
      const data = await response.json();
      
      if (response.ok && data.data.valid) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
      }
    } catch (error) {
      setTokenValid(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.new_password) {
      errors.new_password = 'La nueva contraseña es requerida';
    } else if (formData.new_password.length < 8) {
      errors.new_password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.new_password)) {
      errors.new_password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }

    if (!formData.confirm_password) {
      errors.confirm_password = 'Confirma tu nueva contraseña';
    } else if (formData.new_password !== formData.confirm_password) {
      errors.confirm_password = 'Las contraseñas no coinciden';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (name && validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/password-reset/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: formData.new_password,
          confirm_password: formData.confirm_password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Error al resetear la contraseña');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Token inválido o expirado
  if (tokenValid === false) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <LockOutlined sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
              Enlace inválido o expirado
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              El enlace de recuperación no es válido o ha expirado. 
              Solicita un nuevo enlace de recuperación.
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            onClick={() => navigate('/forgot-password')}
            sx={{ px: 4, py: 1.5 }}
          >
            Solicitar nuevo enlace
          </Button>
        </Paper>
      </Container>
    );
  }

  // Verificando token
  if (tokenValid === null) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CircularProgress size={48} />
          </Box>
          <Typography variant="h6" color="text.secondary">
            Verificando enlace...
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Contraseña reseteada exitosamente
  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <Lock sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
              ¡Contraseña actualizada!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Tu contraseña ha sido actualizada exitosamente. 
              Ahora puedes iniciar sesión con tu nueva contraseña.
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ px: 4, py: 1.5 }}
          >
            Ir al Login
          </Button>
        </Paper>
      </Container>
    );
  }

  // Formulario de reset
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Lock sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Nueva contraseña
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ingresa tu nueva contraseña
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
            label="Nueva contraseña"
            name="new_password"
            type={showPassword ? 'text' : 'password'}
            value={formData.new_password}
            onChange={handleInputChange}
            error={!!validationErrors.new_password}
            helperText={validationErrors.new_password}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Confirmar nueva contraseña"
            name="confirm_password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirm_password}
            onChange={handleInputChange}
            error={!!validationErrors.confirm_password}
            helperText={validationErrors.confirm_password}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    aria-label="toggle confirm password visibility"
                    onClick={handleToggleConfirmPasswordVisibility}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </Button>
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
            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
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
            <Button
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
            >
              Inicia sesión
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;

