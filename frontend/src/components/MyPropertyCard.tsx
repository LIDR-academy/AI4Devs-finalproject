import React, { memo } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  Chip,
  Rating,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { LocationOn, Bed, Bathtub, SquareFoot } from '@mui/icons-material';
import { Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import { IProperty, PropertyStatus } from '../types';
import CurrencyDisplay from './CurrencyDisplay';

interface MyPropertyCardProps {
  property: IProperty;
  onPropertyClick: (propertyId: string) => void;
  onEdit: (propertyId: string) => void;
  onDelete: (propertyId: string) => void;
  onToggleFeatured: (propertyId: string) => void;
  onStatusChange: (propertyId: string, status: PropertyStatus) => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, property: IProperty) => void;
}

const MyPropertyCard: React.FC<MyPropertyCardProps> = memo(({ 
  property, 
  onPropertyClick, 
  onEdit, 
  onDelete, 
  onToggleFeatured, 
  onStatusChange, 
  onMenuClick
}) => {
  const getStatusChip = (status: PropertyStatus, featured: boolean) => {
    const statusConfig = {
      active: { label: 'Activa', color: 'success' as const },
      inactive: { label: 'Inactiva', color: 'default' as const },
      sold: { label: 'Vendida', color: 'warning' as const },
      rented: { label: 'Rentada', color: 'info' as const }
    };

    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <Chip 
          label={config.label} 
          color={config.color} 
          size="small" 
        />
        {featured && (
          <Chip 
            icon={<StarIcon />} 
            label="Destacada" 
            color="primary" 
            size="small" 
          />
        )}
      </Box>
    );
  };

  return (
    <>
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
        onClick={() => onPropertyClick(property.id_property)}
      >
        <CardMedia
          component="img"
          height="200"
          image={property.images?.find(img => img.is_primary)?.url || property.images?.[0]?.url || '/placeholder-property.jpg'}
          alt={property.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Operation Type and Price */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Chip 
              label={property.operation_type === 'sale' ? 'Venta' : 'Renta'} 
              color="primary" 
              size="small" 
            />
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              <CurrencyDisplay
                amount={property.price}
                options={{ currency: property.currency }}
              />
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
          
          {/* Status and Featured */}
          <Box sx={{ mb: 2 }}>
            {getStatusChip(property.status, property.featured)}
          </Box>
          
          {/* Amenidades */}
          {property.amenities && property.amenities.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {property.amenities.slice(0, 3).map((amenity, index) => (
                  <Chip
                    key={index}
                    label={amenity}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: '20px' }}
                  />
                ))}
                {property.amenities.length > 3 && (
                  <Chip
                    label={`+${property.amenities.length - 3} más`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: '20px' }}
                  />
                )}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Rating value={4.5} readOnly size="small" />
            <Typography variant="caption" color="text.secondary">
              {property.views_count || 0} vistas
            </Typography>
          </Box>
        </CardContent>
        
        <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
          <Button 
            size="small" 
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              onPropertyClick(property.id_property);
            }}
          >
            Ver Detalles
          </Button>
          <Button
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(property.id_property);
            }}
          >
            Editar
          </Button>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick(e, property);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </CardActions>
      </Card>

    </>
  );
});

MyPropertyCard.displayName = 'MyPropertyCard';

export default MyPropertyCard;
