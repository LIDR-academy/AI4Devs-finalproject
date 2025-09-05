import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Pagination,
  Alert,
  Skeleton,
  Paper,
  Button,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Favorite,
  Visibility
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFavoriteStore } from '../store/favoriteStore';
import { useAuthStore } from '../store/authStore';
import PropertyCard from '../components/PropertyCard';

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
              <PropertyCard
                property={property}
                onPropertyClick={handlePropertyClick}
              />
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
