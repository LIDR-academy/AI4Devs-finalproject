import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { usePropertyStore } from '../store/propertyStore';
import { IProperty, IPropertyImage, PropertyType, OperationType, PropertyStatus } from '../types';
import ImageUpload from '../components/ImageUpload';

const EditProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    properties, 
    loading, 
    error, 
    fetchProperties, 
    updatePropertyComplete
  } = usePropertyStore();

  const [formData, setFormData] = useState<Partial<IProperty>>({
    title: '',
    description: '',
    property_type: PropertyType.APARTMENT,
    operation_type: OperationType.SALE,
    price: 0,
    currency: 'MXN',
    bedrooms: 0,
    bathrooms: 0,
    sq_meters: 0,
    city: '',
    state: '',
    address: '',
    amenities: [],
    status: PropertyStatus.ACTIVE,
    featured: false
  });

  const [images, setImages] = useState<IPropertyImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [propertyLoaded, setPropertyLoaded] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    const loadProperty = async () => {
      if (id) {
        // Primero intentar cargar todas las propiedades si no están cargadas
        if (properties.length === 0) {
          await fetchProperties();
        }
      }
    };
    
    loadProperty();
  }, [id, fetchProperties]);

  // Efecto separado para cargar los datos cuando las propiedades estén disponibles
  useEffect(() => {
    if (id && properties.length > 0) {
      const property = properties.find(p => p.id_property === id);
      if (property) {
        setFormData(property);
        setImages(property.images || []);
        setPropertyLoaded(true);
      } else {
        console.error('Propiedad no encontrada con ID:', id);
        setPropertyLoaded(false);
      }
    }
  }, [id, properties]);

  // Sincronizar imágenes con formData cuando cambien
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      images: images
    }));
  }, [images]);

  const handleInputChange = (field: keyof IProperty, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: (prev.amenities || []).includes(amenity)
        ? (prev.amenities || []).filter(a => a !== amenity)
        : [...(prev.amenities || []), amenity]
    }));
  };

  const handleAmenityAdd = () => {
    if (newAmenity.trim() && !(formData.amenities || []).includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleAmenityRemove = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: (prev.amenities || []).filter(a => a !== amenity)
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    try {
      const propertyData = {
        ...formData,
        images: images.map((img, index) => ({
          ...img,
          order_index: index
        }))
      };
      await updatePropertyComplete(id, propertyData as IProperty);
      navigate('/my-properties');
    } catch (error) {
      console.error('Error al actualizar propiedad:', error);
      // El error se manejará en el store y se mostrará en la UI
    } finally {
      setSaving(false);
    }
  };

  if (loading || !propertyLoaded) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          {loading ? 'Cargando propiedades...' : 'Cargando datos de la propiedad...'}
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/my-properties')}
          sx={{ mt: 2 }}
        >
          Volver a Mis Propiedades
        </Button>
      </Container>
    );
  }

  const availableAmenities = [
    'Piscina', 'Gimnasio', 'Estacionamiento', 'Seguridad 24/7', 'Jardín',
    'Terraza', 'Balcón', 'Lavandería', 'Aire acondicionado', 'Calefacción',
    'Internet', 'Cable', 'Mascotas permitidas', 'Ascensor', 'Vista al mar'
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/my-properties')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Editar Propiedad
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Información Básica */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información Básica
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Título"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio"
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : formData.currency || '$'}
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Propiedad</InputLabel>
                <Select
                  value={formData.property_type}
                  onChange={(e) => handleInputChange('property_type', e.target.value)}
                >
                  <MenuItem value={PropertyType.APARTMENT}>Apartamento</MenuItem>
                  <MenuItem value={PropertyType.HOUSE}>Casa</MenuItem>
                  <MenuItem value={PropertyType.OFFICE}>Oficina</MenuItem>
                  <MenuItem value={PropertyType.LAND}>Terreno</MenuItem>
                  <MenuItem value={PropertyType.COMMERCIAL}>Comercial</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Operación</InputLabel>
                <Select
                  value={formData.operation_type}
                  onChange={(e) => handleInputChange('operation_type', e.target.value)}
                >
                  <MenuItem value={OperationType.SALE}>Venta</MenuItem>
                  <MenuItem value={OperationType.RENT}>Renta</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </Grid>

            {/* Características */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Características
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Habitaciones"
                type="number"
                value={formData.bedrooms || ''}
                onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Baños"
                type="number"
                value={formData.bathrooms || ''}
                onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Área (m²)"
                type="number"
                value={formData.sq_meters || ''}
                onChange={(e) => handleInputChange('sq_meters', parseFloat(e.target.value) || 0)}
              />
            </Grid>

            {/* Ubicación */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Ubicación
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Ciudad"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Estado"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Dirección"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </Grid>

            {/* Amenidades */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Amenidades
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableAmenities.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    color={formData.amenities?.includes(amenity) ? 'primary' : 'default'}
                    variant={formData.amenities?.includes(amenity) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>

            {/* Imágenes */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Imágenes
              </Typography>
              
              <ImageUpload 
                images={images}
                onImagesChange={setImages}
                maxImages={10}
                disabled={saving}
              />
              
            </Grid>


            {/* Estado */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Estado
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Estado de la Propiedad</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value={PropertyStatus.ACTIVE}>Activa</MenuItem>
                  <MenuItem value={PropertyStatus.INACTIVE}>Inactiva</MenuItem>
                  <MenuItem value={PropertyStatus.SOLD}>Vendida</MenuItem>
                  <MenuItem value={PropertyStatus.RENTED}>Rentada</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Botones */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/my-properties')}
                >
                  Cancelar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

    </Container>
  );
};

export default EditProperty;
