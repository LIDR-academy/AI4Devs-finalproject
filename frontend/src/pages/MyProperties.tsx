import React, { useState, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Rating
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Add as AddIcon,
  Search as SearchIcon,
  LocationOn,
  Bed,
  Bathtub,
  SquareFoot
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../store/propertyStore';
import { IProperty, PropertyStatus } from '../types';
import MyPropertyCard from '../components/MyPropertyCard';

const MyProperties: React.FC = () => {
  const navigate = useNavigate();
  const { userProperties, loading, error, fetchUserProperties, deleteProperty, toggleFeatured, updatePropertyStatus } = usePropertyStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProperty, setSelectedProperty] = useState<IProperty | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<PropertyStatus>(PropertyStatus.ACTIVE);

  useEffect(() => {
    fetchUserProperties();
  }, [fetchUserProperties]);

  const filteredProperties = userProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, property: IProperty) => {
    setAnchorEl(event.currentTarget);
    setSelectedProperty(property);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // No limpiar selectedProperty aquí para que las funciones del menú puedan usarlo
  };

  const handleEdit = () => {
    if (selectedProperty) {
      navigate(`/edit-property/${selectedProperty.id_property}`);
    }
    handleMenuClose();
    setSelectedProperty(null);
  };

  const handleView = () => {
    if (selectedProperty) {
      navigate(`/property/${selectedProperty.id_property}`);
    }
    handleMenuClose();
    setSelectedProperty(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
    // No limpiar selectedProperty aquí porque se necesita para el diálogo
  };

  const handleStatusClick = () => {
    if (selectedProperty) {
      setNewStatus(selectedProperty.status);
      setStatusDialogOpen(true);
    }
    handleMenuClose();
    // No limpiar selectedProperty aquí porque se necesita para el diálogo
  };

  const handleToggleFeatured = async () => {
    if (selectedProperty) {
      try {
        await toggleFeatured(selectedProperty.id_property);
        await fetchUserProperties(); // Refrescar la lista
      } catch (error) {
        console.error('Error al cambiar estado destacado:', error);
      }
    }
    handleMenuClose();
    setSelectedProperty(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedProperty) {
      try {
        await deleteProperty(selectedProperty.id_property);
        await fetchUserProperties(); // Refrescar la lista
        setDeleteDialogOpen(false);
        setSelectedProperty(null);
      } catch (error) {
        console.error('Error al eliminar propiedad:', error);
      }
    }
  };

  const handleStatusUpdate = async () => {
    if (selectedProperty) {
      try {
        await updatePropertyStatus(selectedProperty.id_property, newStatus);
        await fetchUserProperties(); // Refrescar la lista
        setStatusDialogOpen(false);
        setSelectedProperty(null);
      } catch (error) {
        console.error('Error al actualizar estado:', error);
      }
    }
  };

  const getStatusChip = (status: PropertyStatus, featured: boolean) => {
    if (featured) {
      return <Chip icon={<StarIcon />} label="Destacada" color="warning" size="small" />;
    }
    
    switch (status) {
      case PropertyStatus.ACTIVE:
        return <Chip label="Activa" color="success" size="small" />;
      case PropertyStatus.INACTIVE:
        return <Chip label="Inactiva" color="default" size="small" />;
      case PropertyStatus.SOLD:
        return <Chip label="Vendida" color="error" size="small" />;
      case PropertyStatus.RENTED:
        return <Chip label="Rentada" color="info" size="small" />;
      default:
        return <Chip label="Desconocido" color="default" size="small" />;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'MXN'
    }).format(price);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Mis Propiedades
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-property')}
        >
          Nueva Propiedad
        </Button>
      </Box>

      {/* Filtros */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar propiedades..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 300 }}
        />
        <TextField
          select
          label="Estado"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">Todas</MenuItem>
          <MenuItem value="active">Activas</MenuItem>
          <MenuItem value="inactive">Inactivas</MenuItem>
          <MenuItem value="sold">Vendidas</MenuItem>
          <MenuItem value="rented">Rentadas</MenuItem>
        </TextField>
      </Box>

      {/* Lista de Propiedades */}
      {filteredProperties.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {userProperties.length === 0 ? 'No tienes propiedades registradas' : 'No se encontraron propiedades'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {userProperties.length === 0 
              ? 'Comienza creando tu primera propiedad' 
              : 'Intenta ajustar los filtros de búsqueda'
            }
          </Typography>
          {userProperties.length === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-property')}
            >
              Crear Primera Propiedad
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProperties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.id_property}>
              <MyPropertyCard
                property={property}
                onPropertyClick={(id) => navigate(`/property/${id}`)}
                onEdit={(id) => navigate(`/edit-property/${id}`)}
                onDelete={(id) => {
                  setSelectedProperty(property);
                  setDeleteDialogOpen(true);
                }}
                onToggleFeatured={handleToggleFeatured}
                onStatusChange={(id, status) => {
                  setSelectedProperty(property);
                  setNewStatus(status);
                  setStatusDialogOpen(true);
                }}
                onMenuClick={handleMenuClick}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Menú de Acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver Detalles</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleToggleFeatured}>
          <ListItemIcon>
            {selectedProperty?.featured ? <StarBorderIcon fontSize="small" /> : <StarIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {selectedProperty?.featured ? 'Quitar Destacada' : 'Marcar Destacada'}
          </ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleStatusClick}>
          <ListItemIcon>
            {selectedProperty?.status === PropertyStatus.ACTIVE ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>Cambiar Estado</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>

      {/* Diálogo de Eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar la propiedad "{selectedProperty?.title}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialogOpen(false);
            setSelectedProperty(null);
          }}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Cambio de Estado */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Cambiar Estado de Propiedad</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Nuevo Estado"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as PropertyStatus)}
            sx={{ mt: 2 }}
          >
            <MenuItem value={PropertyStatus.ACTIVE}>Activa</MenuItem>
            <MenuItem value={PropertyStatus.INACTIVE}>Inactiva</MenuItem>
            <MenuItem value={PropertyStatus.SOLD}>Vendida</MenuItem>
            <MenuItem value={PropertyStatus.RENTED}>Rentada</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setStatusDialogOpen(false);
            setSelectedProperty(null);
          }}>Cancelar</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Actualizar Estado
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyProperties;
