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
  Typography
} from '@mui/material';
import { LocationOn, Bed, Bathtub, SquareFoot } from '@mui/icons-material';
import { IProperty } from '../types';
import CurrencyDisplay from './CurrencyDisplay';
import FavoriteButton from './FavoriteButton';

interface PropertyCardProps {
  property: IProperty;
  onPropertyClick: (propertyId: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = memo(({ property, onPropertyClick }) => {
  return (
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
        <FavoriteButton
          propertyId={property.id_property}
          size="small"
          color="primary"
        />
      </CardActions>
    </Card>
  );
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;
