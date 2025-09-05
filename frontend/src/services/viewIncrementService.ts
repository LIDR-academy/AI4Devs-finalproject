// Servicio simple para manejar el incremento de vistas
class ViewIncrementService {
  private static instance: ViewIncrementService;
  private lastIncrement: string | null = null;
  private lastIncrementTime: number = 0;

  private constructor() {}

  static getInstance(): ViewIncrementService {
    if (!ViewIncrementService.instance) {
      ViewIncrementService.instance = new ViewIncrementService();
    }
    return ViewIncrementService.instance;
  }

  async incrementView(propertyId: string): Promise<boolean> {
    const now = Date.now();
    
    // Si es la misma propiedad y fue hace menos de 5 segundos, no hacer nada
    if (this.lastIncrement === propertyId && (now - this.lastIncrementTime) < 5000) {
      console.log(`ViewIncrementService: Incremento reciente para ${propertyId}, ignorando`);
      return false;
    }

    try {
      const response = await fetch(`/api/properties/${propertyId}/increment-views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        this.lastIncrement = propertyId;
        this.lastIncrementTime = now;
        console.log(`ViewIncrementService: Incremento exitoso para ${propertyId}`);
        return true;
      } else {
        console.error(`ViewIncrementService: Error al incrementar vistas para ${propertyId}`);
        return false;
      }
    } catch (error) {
      console.error(`ViewIncrementService: Error en la llamada para ${propertyId}:`, error);
      return false;
    }
  }
}

export default ViewIncrementService.getInstance();
