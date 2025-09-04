import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  InputAdornment,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  Home, 
  Business, 
  LocationOn, 
  Description,
  Add,
  Remove
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../store/propertyStore';
import { useAuthStore } from '../store/authStore';
import CurrencyInput from '../components/CurrencyInput';

const steps = ['Información básica', 'Detalles', 'Ubicación y precio'];

const CreateProperty: React.FC = () => {
  const navigate = useNavigate();
  const { createProperty, isLoading: loading, error } = usePropertyStore();
  const { user } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: '',
    operation_type: '',
    price: '',
    currency: 'MXN',
    bedrooms: '',
    bathrooms: '',
    sq_meters: '',
    address: '',
    city: '',
    state: '',
    amenities: [] as string[],
    images: [] as string[]
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [newAmenity, setNewAmenity] = useState('');

  const propertyTypes = [
    { value: 'house', label: 'Casa' },
    { value: 'apartment', label: 'Departamento' },
    { value: 'office', label: 'Oficina' },
    { value: 'land', label: 'Terreno' },
    { value: 'commercial', label: 'Local Comercial' }
  ];

  const operationTypes = [
    { value: 'sale', label: 'Venta' },
    { value: 'rent', label: 'Renta' },
    { value: 'transfer', label: 'Traspaso' }
  ];

  const currencies = [
    { value: 'MXN', label: 'Pesos Mexicanos (MXN)' },
    { value: 'USD', label: 'Dólares Americanos (USD)' },
    { value: 'EUR', label: 'Euros (EUR)' }
  ];

  const commonAmenities = [
    'Estacionamiento', 'Jardín', 'Terraza', 'Balcón', 'Alberca',
    'Gimnasio', 'Seguridad 24/7', 'Elevador', 'Aire acondicionado',
    'Calefacción', 'Internet', 'Cable TV', 'Lavadora', 'Secadora'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
    
    if (name && validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
    
    if (name && validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAmenityAdd = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleAmenityRemove = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      handleAmenityRemove(amenity);
    } else {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
    }
  };

  const validateStep = (step: number) => {
    const errors: {[key: string]: string} = {};

    if (step === 0) {
      if (!formData.title) errors.title = 'El título es requerido';
      if (!formData.property_type) errors.property_type = 'El tipo de propiedad es requerido';
      if (!formData.operation_type) errors.operation_type = 'El tipo de operación es requerido';
    }

    if (step === 1) {
      if (!formData.description) errors.description = 'La descripción es requerida';
      if (formData.bedrooms && parseInt(formData.bedrooms) < 0) errors.bedrooms = 'No puede ser negativo';
      if (formData.bathrooms && parseInt(formData.bathrooms) < 0) errors.bathrooms = 'No puede ser negativo';
      if (formData.sq_meters && parseFloat(formData.sq_meters) <= 0) errors.sq_meters = 'Debe ser mayor a 0';
    }

    if (step === 2) {
      if (!formData.price) errors.price = 'El precio es requerido';
      if (parseFloat(formData.price) <= 0) errors.price = 'El precio debe ser mayor a 0';
      if (!formData.address) errors.address = 'La dirección es requerida';
      if (!formData.city) errors.city = 'La ciudad es requerida';
      if (!formData.state) errors.state = 'El estado es requerido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    try {
      await createProperty({
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        sq_meters: formData.sq_meters ? parseFloat(formData.sq_meters) : undefined,
      });
      navigate('/');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleCancel = () => {
    // Verificar si hay datos ingresados
    const hasData = formData.title || formData.description || formData.price || 
                   formData.address || formData.city || formData.state;
    
    if (hasData) {
      const confirmed = window.confirm(
        '¿Estás seguro de que quieres cancelar? Se perderán todos los datos ingresados.'
      );
      if (confirmed) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título de la propiedad"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={!!validationErrors.title}
                helperText={validationErrors.title}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Home color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!validationErrors.property_type}>
                <InputLabel>Tipo de propiedad</InputLabel>
                <Select
                  name="property_type"
                  value={formData.property_type}
                  label="Tipo de propiedad"
                  onChange={handleSelectChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <Home color="action" />
                    </InputAdornment>
                  }
                >
                  {propertyTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.property_type && (
                  <FormHelperText>{validationErrors.property_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!validationErrors.operation_type}>
                <InputLabel>Tipo de operación</InputLabel>
                <Select
                  name="operation_type"
                  value={formData.operation_type}
                  label="Tipo de operación"
                  onChange={handleSelectChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <Business color="action" />
                    </InputAdornment>
                  }
                >
                  {operationTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.operation_type && (
                  <FormHelperText>{validationErrors.operation_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={!!validationErrors.description}
                helperText={validationErrors.description}
                multiline
                rows={4}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Recámaras"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleInputChange}
                error={!!validationErrors.bedrooms}
                helperText={validationErrors.bedrooms}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Baños"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleInputChange}
                error={!!validationErrors.bathrooms}
                helperText={validationErrors.bathrooms}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Metros cuadrados"
                name="sq_meters"
                type="number"
                value={formData.sq_meters}
                onChange={handleInputChange}
                error={!!validationErrors.sq_meters}
                helperText={validationErrors.sq_meters}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Amenidades
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {commonAmenities.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    color={formData.amenities.includes(amenity) ? 'primary' : 'default'}
                    variant={formData.amenities.includes(amenity) ? 'filled' : 'outlined'}
                    clickable
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  label="Agregar amenidad personalizada"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAmenityAdd()}
                />
                <Button
                  variant="outlined"
                  onClick={handleAmenityAdd}
                  startIcon={<Add />}
                >
                  Agregar
                </Button>
              </Box>
              {formData.amenities.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Amenidades seleccionadas:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.amenities.map((amenity) => (
                      <Chip
                        key={amenity}
                        label={amenity}
                        onDelete={() => handleAmenityRemove(amenity)}
                        color="primary"
                        deleteIcon={<Remove />}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <CurrencyInput
                fullWidth
                label="Precio"
                value={formData.price}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, price: value.toString() }));
                  if (validationErrors.price) {
                    setValidationErrors(prev => ({ ...prev, price: '' }));
                  }
                }}
                error={!!validationErrors.price}
                helperText={validationErrors.price}
                required
                currency={formData.currency}
                showCurrencySymbol={true}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Moneda</InputLabel>
                <Select
                  name="currency"
                  value={formData.currency}
                  label="Moneda"
                  onChange={handleSelectChange}
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección completa"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                error={!!validationErrors.address}
                helperText={validationErrors.address}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                error={!!validationErrors.city}
                helperText={validationErrors.city}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estado"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                error={!!validationErrors.state}
                helperText={validationErrors.state}
                required
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="warning">
          Debes iniciar sesión para crear una propiedad.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Button
            variant="text"
            onClick={handleCancel}
            color="secondary"
            sx={{ minWidth: 'auto' }}
          >
            ← Volver
          </Button>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Crear Nueva Propiedad
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Completa la información de tu propiedad
            </Typography>
          </Box>
          <Box sx={{ minWidth: 80 }} /> {/* Espaciador para centrar el título */}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4, mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              color="secondary"
            >
              Cancelar
            </Button>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Atrás
            </Button>
          </Box>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                size="large"
              >
                {loading ? 'Creando...' : 'Crear Propiedad'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                size="large"
              >
                Siguiente
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateProperty;
