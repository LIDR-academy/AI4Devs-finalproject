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
  Chip,
  Box,
  Pagination,
  Alert,
  Skeleton,
  Paper,
  Divider
} from '@mui/material';
import {
  Favorite,
  LocationOn,
  Bed,
  Bathtub,
  SquareFoot,
  Visibility,
  Message
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFavoriteStore } from '../store/favoriteStore';
import { useAuthStore } from '../store/authStore';
import CurrencyDisplay from '../components/CurrencyDisplay';
import RemoveFavoriteButton from '../components/RemoveFavoriteButton';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    favorites,
    isLoading,
    error,
    pagination,
    fetchFavorites,
    clearError
  } = useFavoriteStore();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchFavorites(currentPage);
  }, [isAuthenticated, currentPage, fetchFavorites, navigate]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleRemoveFavorite = async () => {
    // Refrescar la lista después de remover un favorito
    console.log('[Favorites] Favorite removed, refreshing list');
    await fetchFavorites(currentPage);
  };

  if (!isAuthenticated) {
    return null; // Ya se está redirigiendo
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Favorite color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Mis Favoritos
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {user?.first_name}, aquí tienes todas las propiedades que has marcado como favoritas
        </Typography>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Content */}
      {isLoading && favorites.length === 0 ? (
        // Loading skeletons
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} width="80%" />
                  <Skeleton variant="text" height={24} width="60%" />
                  <Skeleton variant="text" height={20} width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : favorites.length === 0 ? (
        // Empty state
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
          <Favorite color="action" sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
            No tienes favoritos aún
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Explora las propiedades disponibles y agrega a tus favoritos las que más te gusten
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
            startIcon={<Visibility />}
          >
            Explorar Propiedades
          </Button>
        </Paper>
      ) : (
        // Favorites list
        <>
          <Grid container spacing={3}>
            {favorites.map((property) => (
              <Grid item xs={12} sm={6} md={4} key={property.id_property}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                  onClick={() => handlePropertyClick(property.id_property)}
                >
                  {/* Property Image */}
                  <CardMedia
                    component="img"
                    height="200"
                    image={property.images?.[0] || '/placeholder-property.jpg'}
                    alt={property.title}
                    sx={{ objectFit: 'cover' }}
                  />

                  {/* Property Content */}
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Title and Price */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', flex: 1, mr: 1 }}>
                        {property.title}
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        <CurrencyDisplay
                          amount={property.price}
                          options={{ currency: property.currency }}
                        />
                      </Typography>
                    </Box>

                    {/* Location */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn color="action" sx={{ fontSize: 20, mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {property.city}, {property.state}
                      </Typography>
                    </Box>

                    {/* Property Details */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      {property.bedrooms && property.bedrooms > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Bed color="action" sx={{ fontSize: 18, mr: 0.5 }} />
                          <Typography variant="body2">{property.bedrooms}</Typography>
                        </Box>
                      )}
                      {property.bathrooms && property.bathrooms > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Bathtub color="action" sx={{ fontSize: 18, mr: 0.5 }} />
                          <Typography variant="body2">{property.bathrooms}</Typography>
                        </Box>
                      )}
                      {property.sq_meters && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SquareFoot color="action" sx={{ fontSize: 18, mr: 0.5 }} />
                          <Typography variant="body2">{property.sq_meters}m²</Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Operation Type and Property Type */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={property.operation_type === 'sale' ? 'Venta' : 'Renta'}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={property.property_type === 'house' ? 'Casa' : 
                               property.property_type === 'apartment' ? 'Departamento' : 
                               property.property_type === 'land' ? 'Terreno' : 'Otro'}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    {/* Stats */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2">{property.views_count || 0}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Message sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2">{property.contact_count || 0}</Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePropertyClick(property.id_property);
                      }}
                    >
                      Ver Detalles
                    </Button>
                    <RemoveFavoriteButton
                      propertyId={property.id_property}
                      size="small"
                      color="error"
                      onRemove={handleRemoveFavorite}
                    />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          {/* Summary */}
          <Paper elevation={1} sx={{ p: 3, mt: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Resumen de Favoritos
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {pagination.totalItems}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Propiedades Favoritas
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {pagination.currentPage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Página Actual
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {pagination.totalPages}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total de Páginas
                </Typography>
              </Box>
            </Box>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default Favorites;
