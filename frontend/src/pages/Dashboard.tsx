import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useProperties, useIsLoading, useError, usePropertyStore } from '../store/propertyStore';
import { IProperty } from '../types';
import PropertyCard from '../components/PropertyCard';
import PropertySkeleton from '../components/PropertySkeleton';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const properties = useProperties();
  const loading = useIsLoading();
  const error = useError();
  const fetchProperties = usePropertyStore((state) => state.fetchProperties);
  const [featuredProperties, setFeaturedProperties] = useState<IProperty[]>([]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    if (properties.length > 0) {
      setFeaturedProperties(properties.slice(0, 6));
    }
  }, [properties]);



  const handlePropertyClick = useCallback((propertyId: string) => {
    navigate(`/property/${propertyId}`);
  }, [navigate]);

  const handleCreateProperty = useCallback(() => {
    navigate('/create-property');
  }, [navigate]);

  const handleSearchProperties = useCallback(() => {
    navigate('/search');
  }, [navigate]);

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
              <PropertySkeleton />
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
            <Grid item xs={12} sm={6} md={4} key={property.id_property}>
              <PropertyCard
                property={property}
                onPropertyClick={handlePropertyClick}
              />
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
