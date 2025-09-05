import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Snackbar
} from '@mui/material';
import {
  LocationOn,
  Bed,
  Bathtub,
  SquareFoot,
  Share,
  Phone,
  Email,
  Message,
  ArrowBack,
  Close,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import CurrencyDisplay from '../components/CurrencyDisplay';
import FavoriteButton from '../components/FavoriteButton';
import { IPropertyImage } from '../types';
import viewIncrementService from '../services/viewIncrementService';

interface PropertyDetailData {
  id_property: string;
  title: string;
  description?: string;
  property_type: string;
  operation_type: string;
  price: number;
  currency: string;
  bedrooms?: number;
  bathrooms?: number;
  images?: IPropertyImage[];
  sq_meters?: number;
  address: string;
  city: string;
  state: string;
  amenities?: string[];
  views_count: number;
  created_at: string;
  owner: {
    id_user: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [property, setProperty] = useState<PropertyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef<string | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchPropertyDetail = async (propertyId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/properties/${propertyId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar la propiedad');
      }
      
      setProperty(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && hasFetchedRef.current !== id) {
      console.log('PropertyDetail: Ejecutando fetchPropertyDetail para ID:', id);
      fetchPropertyDetail(id);
      // Incrementar vistas por separado
      viewIncrementService.incrementView(id);
      hasFetchedRef.current = id;
    }
  }, [id, fetchPropertyDetail]);

  // Reset del ref cuando el componente se desmonta
  useEffect(() => {
    return () => {
      hasFetchedRef.current = null;
    };
  }, []);

  // Manejar navegación con teclado cuando el diálogo de imagen está abierto
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (imageDialogOpen && property?.images) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          handlePreviousImage();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          handleNextImage();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          setImageDialogOpen(false);
        }
      }
    };

    if (imageDialogOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageDialogOpen, property?.images, currentImageIndex]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: property?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSnackbarMessage('Enlace copiado al portapapeles');
      setSnackbarOpen(true);
    }
  };

  const handleContactClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setContactDialogOpen(true);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí implementarías el envío del mensaje
    setSnackbarMessage('Mensaje enviado exitosamente');
    setSnackbarOpen(true);
    setContactDialogOpen(false);
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };

  const handleImageClick = (imageUrl: string) => {
    const imageIndex = property?.images?.findIndex(img => img.url === imageUrl) || 0;
    setCurrentImageIndex(imageIndex);
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  const handlePreviousImage = () => {
    if (property?.images && currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(property.images[newIndex].url);
    }
  };

  const handleNextImage = () => {
    if (property?.images && currentImageIndex < property.images.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(property.images[newIndex].url);
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      house: 'Casa',
      apartment: 'Departamento',
      office: 'Oficina',
      land: 'Terreno',
      commercial: 'Local Comercial'
    };
    return types[type] || type;
  };

  const getOperationTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      sale: 'Venta',
      rent: 'Renta',
      transfer: 'Traspaso'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBackClick}
        >
          Volver
        </Button>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Propiedad no encontrada
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBackClick}
        >
          Volver
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header con botón de regreso */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={handleBackClick} color="primary">
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {property.title}
        </Typography>
        <IconButton onClick={handleShareClick} color="primary">
          <Share />
        </IconButton>
        <FavoriteButton propertyId={property.id_property} />
      </Box>

      <Grid container spacing={4}>
        {/* Imagen principal */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardMedia
              component="img"
              height="400"
              image={property.images?.find(img => img.is_primary)?.url || property.images?.[0]?.url || '/placeholder-property.jpg'}
              alt={property.title}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleImageClick(property.images?.find(img => img.is_primary)?.url || property.images?.[0]?.url || '/placeholder-property.jpg')}
            />
            <CardContent>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={getPropertyTypeLabel(property.property_type)} 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  label={getOperationTypeLabel(property.operation_type)} 
                  color="secondary" 
                  variant="outlined" 
                />
              </Box>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
                <CurrencyDisplay amount={property.price} options={{ currency: property.currency }} />
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {property.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Galería de imágenes */}
          {property.images && property.images.length > 1 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Galería de Imágenes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  {property.images.slice(1).map((image, index) => (
                    <Grid item xs={6} sm={4} md={3} key={image.id_property_image}>
                      <CardMedia
                        component="img"
                        height="120"
                        image={image.url}
                        alt={image.alt_text || `Imagen ${index + 2}`}
                        sx={{ 
                          cursor: 'pointer',
                          borderRadius: 1,
                          '&:hover': {
                            opacity: 0.8
                          }
                        }}
                        onClick={() => handleImageClick(image.url)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Detalles de la propiedad */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detalles de la Propiedad
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {property.bedrooms && (
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Bed color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Recámaras
                        </Typography>
                        <Typography variant="h6">
                          {property.bedrooms}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {property.bathrooms && (
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Bathtub color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Baños
                        </Typography>
                        <Typography variant="h6">
                          {property.bathrooms}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {property.sq_meters && (
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SquareFoot color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          m²
                        </Typography>
                        <Typography variant="h6">
                          {property.sq_meters}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Vistas
                      </Typography>
                      <Typography variant="h6">
                        {property.views_count}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Amenidades */}
          {property.amenities && property.amenities.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Amenidades
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {property.amenities.map((amenity, index) => (
                    <Chip
                      key={index}
                      label={amenity}
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Panel lateral */}
        <Grid item xs={12} md={4}>
          {/* Información de contacto */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información de Contacto
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {property.owner.first_name} {property.owner.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Propietario
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                fullWidth
                startIcon={<Message />}
                onClick={handleContactClick}
                sx={{ mb: 2 }}
              >
                Enviar Mensaje
              </Button>
              
              {property.owner.phone && (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Phone />}
                  href={`tel:${property.owner.phone}`}
                  sx={{ mb: 1 }}
                >
                  Llamar
                </Button>
              )}
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Email />}
                href={`mailto:${property.owner.email}`}
              >
                Email
              </Button>
            </CardContent>
          </Card>

          {/* Ubicación */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ubicación
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="body1">
                    {property.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {property.city}, {property.state}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog para imagen ampliada */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            minHeight: '70vh'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">
              Imagen {property?.images ? `${currentImageIndex + 1} de ${property.images.length}` : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Usa las flechas del teclado o los botones para navegar • ESC para cerrar
            </Typography>
          </Box>
          <IconButton onClick={() => setImageDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          {/* Botón anterior */}
          {property?.images && currentImageIndex > 0 && (
            <IconButton
              onClick={handlePreviousImage}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                }
              }}
            >
              <ChevronLeft />
            </IconButton>
          )}

          {/* Botón siguiente */}
          {property?.images && currentImageIndex < property.images.length - 1 && (
            <IconButton
              onClick={handleNextImage}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                }
              }}
            >
              <ChevronRight />
            </IconButton>
          )}

          {/* Imagen */}
          <img
            src={selectedImage}
            alt="Propiedad"
            style={{ 
              width: '100%', 
              height: '70vh', 
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para contacto */}
      <Dialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Contactar al Propietario</DialogTitle>
        <form onSubmit={handleContactSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nombre"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Teléfono"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Mensaje"
              multiline
              rows={4}
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              Enviar Mensaje
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default PropertyDetail;
