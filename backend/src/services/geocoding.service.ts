import axios from 'axios';
import { logger } from '../utils/logger';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
}

export class GeocodingService {
  /**
   * Geocodifica una dirección usando Google Maps Geocoding API
   * @param address Dirección completa
   * @param postalCode Código postal
   * @returns Coordenadas (latitude, longitude) o null si falla
   */
  async geocodeAddress(
    address: string,
    postalCode: string,
  ): Promise<GeocodingResult | null> {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        logger.warn('GOOGLE_MAPS_API_KEY no está configurada, geocodificación deshabilitada');
        return null;
      }

      const fullAddress = `${address}, ${postalCode}`;
      logger.info(`Geocodificando dirección: ${fullAddress}`);

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            address: fullAddress,
            key: apiKey,
          },
          timeout: 5000, // 5 segundos de timeout
        },
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        const coordinates = {
          latitude: location.lat,
          longitude: location.lng,
        };

        logger.info(
          `Geocodificación exitosa: ${coordinates.latitude}, ${coordinates.longitude}`,
        );
        return coordinates;
      }

      logger.warn(
        `Geocodificación falló para ${fullAddress}: ${response.data.status}`,
      );
      return null;
    } catch (error) {
      logger.error('Error en geocodificación:', error);
      return null;
    }
  }
}
