import React, { useState, useEffect, useCallback } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFavoriteStore } from '../store/favoriteStore';
import { useAuthStore } from '../store/authStore';
import { useFavoriteEvents } from '../utils/favoriteEvents';

interface FavoriteButtonProps {
  propertyId: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'default';
  showTooltip?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  propertyId,
  size = 'medium',
  color = 'primary',
  showTooltip = true,
  onToggle
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  const { checkFavoriteStatus, addToFavorites, removeFromFavorites } = useFavoriteStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { subscribeToFavoriteAdded, subscribeToFavoriteRemoved } = useFavoriteEvents();

  // Verificar estado inicial del favorito
  const checkStatus = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const status = await checkFavoriteStatus(propertyId);
        setIsFavorite(status);
      } catch (error) {
        console.error(`Error checking favorite status for property ${propertyId}:`, error);
        setIsFavorite(false);
      } finally {
        setIsChecking(false);
      }
    } else {
      setIsChecking(false);
    }
  }, [propertyId, isAuthenticated, checkFavoriteStatus]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Escuchar eventos de favoritos para sincronizar estado
  useEffect(() => {
    const unsubscribeAdded = subscribeToFavoriteAdded((eventPropertyId) => {
      if (eventPropertyId === propertyId) {
        console.log(`[FavoriteButton] Property ${propertyId} added to favorites, updating state`);
        setIsFavorite(true);
      }
    });

    const unsubscribeRemoved = subscribeToFavoriteRemoved((eventPropertyId) => {
      if (eventPropertyId === propertyId) {
        console.log(`[FavoriteButton] Property ${propertyId} removed from favorites, updating state`);
        setIsFavorite(false);
      }
    });

    return () => {
      unsubscribeAdded();
      unsubscribeRemoved();
    };
  }, [propertyId, subscribeToFavoriteAdded, subscribeToFavoriteRemoved]);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirigir al login si no está autenticado (sin refresh)
      navigate('/login');
      return;
    }

    console.log(`[FavoriteButton] Starting toggle for property ${propertyId}, current status: ${isFavorite}`);
    setIsLoading(true);
    
    try {
      if (isFavorite) {
        console.log(`[FavoriteButton] Removing property ${propertyId} from favorites`);
        await removeFromFavorites(propertyId);
        setIsFavorite(false);
        onToggle?.(false);
        console.log(`[FavoriteButton] Successfully removed property ${propertyId} from favorites`);
      } else {
        console.log(`[FavoriteButton] Adding property ${propertyId} to favorites`);
        await addToFavorites(propertyId);
        setIsFavorite(true);
        onToggle?.(true);
        console.log(`[FavoriteButton] Successfully added property ${propertyId} to favorites`);
      }
    } catch (error) {
      console.error(`[FavoriteButton] Error al cambiar favorito para propiedad ${propertyId}:`, error);
      // El estado se mantiene igual en caso de error
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isFavorite, propertyId, navigate, removeFromFavorites, addToFavorites, onToggle]);

  if (isChecking) {
    return (
      <IconButton size={size} disabled>
        <CircularProgress size={20} />
      </IconButton>
    );
  }

  const button = (
    <IconButton
      size={size}
      color={color}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      sx={{
        '&:hover': {
          transform: 'scale(1.1)',
          transition: 'transform 0.2s ease-in-out'
        }
      }}
    >
      {isLoading ? (
        <CircularProgress size={20} />
      ) : isFavorite ? (
        <Favorite />
      ) : (
        <FavoriteBorder />
      )}
    </IconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip
        title={
          !isAuthenticated
            ? 'Inicia sesión para agregar a favoritos'
            : isFavorite
            ? 'Remover de favoritos'
            : 'Agregar a favoritos'
        }
        arrow
      >
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default FavoriteButton;
