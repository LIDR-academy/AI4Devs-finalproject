import React, { useState } from 'react';
import { IconButton, Tooltip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { useFavoriteStore } from '../store/favoriteStore';

interface RemoveFavoriteButtonProps {
  propertyId: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'default';
  showTooltip?: boolean;
  onRemove?: () => void;
}

const RemoveFavoriteButton: React.FC<RemoveFavoriteButtonProps> = ({
  propertyId,
  size = 'medium',
  color = 'error',
  showTooltip = true,
  onRemove
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { removeFromFavorites } = useFavoriteStore();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    setShowConfirmDialog(false);
    console.log(`[RemoveFavoriteButton] Removing property ${propertyId} from favorites`);
    setIsLoading(true);
    
    try {
      await removeFromFavorites(propertyId);
      console.log(`[RemoveFavoriteButton] Successfully removed property ${propertyId} from favorites`);
      onRemove?.();
    } catch (error) {
      console.error(`[RemoveFavoriteButton] Error removing favorite for property ${propertyId}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRemove = () => {
    setShowConfirmDialog(false);
  };

  const button = (
    <IconButton
      size={size}
      color={color}
      onClick={handleClick}
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
      ) : (
        <Favorite />
      )}
    </IconButton>
  );

  return (
    <>
      {showTooltip ? (
        <Tooltip
          title="Remover de favoritos"
          arrow
        >
          {button}
        </Tooltip>
      ) : (
        button
      )}

      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelRemove}
        aria-labelledby="remove-favorite-dialog-title"
        aria-describedby="remove-favorite-dialog-description"
      >
        <DialogTitle id="remove-favorite-dialog-title">
          ¿Remover de favoritos?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="remove-favorite-dialog-description">
            ¿Estás seguro de que quieres remover esta propiedad de tus favoritos? 
            Esta acción se puede deshacer agregando la propiedad nuevamente a favoritos.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemove} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmRemove} color="error" variant="contained">
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RemoveFavoriteButton;
