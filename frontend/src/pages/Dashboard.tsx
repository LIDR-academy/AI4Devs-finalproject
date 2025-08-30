import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  Chip,
  Rating,
  Skeleton,
  Alert
} from '@mui/material';
import { LocationOn, Bed, Bathtub, SquareFoot } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../store/propertyStore';
import { IProperty } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { properties, isLoading: loading, error, fetchProperties } = usePropertyStore();
  const [featuredProperties, setFeaturedProperties] = useState<IProperty[]>([]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    if (properties.length > 0) {
      setFeaturedProperties(properties.slice(0, 6));
    }
  }, [properties]);

  const formatPrice = (price: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePropertyClick = (propertyId: number) => {
    navigate(`/property/${propertyId}`);
  };

  const handleCreateProperty = () => {
    navigate('/create-property');
  };

  const handleSearchProperties = () => {
    navigate('/search');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bienvenido a ZonMatch
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Encuentra tu hogar ideal
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Bienvenido a ZonMatch
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
          Encuentra tu hogar ideal en la zona que más te guste
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSearchProperties}
            sx={{ px: 4, py: 1.5 }}
          >
            Buscar Propiedades
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleCreateProperty}
            sx={{ px: 4, py: 1.5 }}
          >
            Publicar Propiedad
          </Button>
        </Box>
      </Box>

      {/* Featured Properties */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
          Propiedades Destacadas
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error al cargar las propiedades: {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {featuredProperties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
                onClick={() => handlePropertyClick(property.id)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={property.images?.[0] || '/placeholder-property.jpg'}
                  alt={property.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Chip 
                      label={property.operation_type === 'sale' ? 'Venta' : 'Renta'} 
                      color="primary" 
                      size="small" 
                    />
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {formatPrice(property.price, property.currency)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {property.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {property.city}, {property.state}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    {property.bedrooms && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Bed sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2">{property.bedrooms}</Typography>
                      </Box>
                    )}
                    {property.bathrooms && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Bathtub sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2">{property.bathrooms}</Typography>
                      </Box>
                    )}
                    {property.sq_meters && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SquareFoot sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2">{property.sq_meters}m²</Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {property.description?.substring(0, 100)}...
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Rating value={4.5} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      {property.views_count || 0} vistas
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    size="small" 
                    color="primary"
                    fullWidth
                  >
                    Ver Detalles
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {featuredProperties.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay propiedades destacadas disponibles
            </Typography>
            <Button variant="contained" onClick={handleCreateProperty}>
              Sé el primero en publicar
            </Button>
          </Box>
        )}
      </Box>

      {/* Stats Section */}
      <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          ZonMatch en números
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item>
            <Typography variant="h4" color="primary" fontWeight="bold">
              1,234
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Propiedades
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h4" color="primary" fontWeight="bold">
              567
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Usuarios
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h4" color="primary" fontWeight="bold">
              89
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ciudades
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
