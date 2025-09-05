import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Alert,
  LinearProgress,
  Grid,
  Card,
  CardMedia,
  CardActions
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Star,
  StarBorder,
  Reorder
} from '@mui/icons-material';
import { IPropertyImage } from '../types';

interface ImageUploadProps {
  images: IPropertyImage[];
  onImagesChange: (images: IPropertyImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Verificar límite de imágenes
    if (images.length + files.length > maxImages) {
      alert(`Solo puedes subir máximo ${maxImages} imágenes`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const newImages: IPropertyImage[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Simular subida a Cloudinary (en producción usarías la API real)
        const mockUpload = () => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Simular delay de subida
            setTimeout(() => {
              resolve(reader.result as string);
            }, 1000 + Math.random() * 2000);
          };
          reader.readAsDataURL(file);
        });

        const imageUrl = await mockUpload();
        
        const newImage: IPropertyImage = {
          id_property_image: `temp-${Date.now()}-${i}`,
          property_id: '', // Se asignará cuando se cree la propiedad
          url: imageUrl,
          alt_text: file.name,
          is_primary: images.length === 0 && i === 0, // Primera imagen es principal
          order_index: images.length + i,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        newImages.push(newImage);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      onImagesChange([...images, ...newImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error al subir las imágenes');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id_property_image !== imageId);
    // Reordenar índices
    const reorderedImages = updatedImages.map((img, index) => ({
      ...img,
      order_index: index
    }));
    onImagesChange(reorderedImages);
  };

  const handleSetPrimary = (imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      is_primary: img.id_property_image === imageId
    }));
    onImagesChange(updatedImages);
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    
    // Actualizar order_index
    const reorderedImages = updatedImages.map((img, index) => ({
      ...img,
      order_index: index
    }));
    onImagesChange(reorderedImages);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Imágenes de la Propiedad
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sube hasta {maxImages} imágenes. La primera imagen será la principal.
      </Typography>

      {/* Botón de subida */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: 'primary.main',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          '&:hover': disabled ? {} : { borderColor: 'primary.dark' }
        }}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          Haz clic para subir imágenes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          PNG, JPG, JPEG hasta 10MB cada una
        </Typography>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={disabled}
        />
      </Paper>

      {/* Barra de progreso */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Subiendo imágenes... {Math.round(uploadProgress)}%
          </Typography>
        </Box>
      )}

      {/* Galería de imágenes */}
      {images.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Imágenes subidas ({images.length}/{maxImages})
          </Typography>
          <Grid container spacing={2}>
            {images
              .sort((a, b) => a.order_index - b.order_index)
              .map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={image.id_property_image}>
                  <Card sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={image.url}
                      alt={image.alt_text}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleSetPrimary(image.id_property_image)}
                          color={image.is_primary ? 'warning' : 'default'}
                        >
                          {image.is_primary ? <Star /> : <StarBorder />}
                        </IconButton>
                        {image.is_primary && (
                          <Typography variant="caption" color="warning.main">
                            Principal
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        {index > 0 && (
                          <IconButton
                            size="small"
                            onClick={() => handleMoveImage(index, index - 1)}
                            disabled={disabled}
                          >
                            <Reorder />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveImage(image.id_property_image)}
                          disabled={disabled}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}

      {images.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Agrega al menos una imagen para mostrar tu propiedad
        </Alert>
      )}
    </Box>
  );
};

export default ImageUpload;
