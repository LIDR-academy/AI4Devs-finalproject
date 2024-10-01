import { Router } from 'express';
import { TripController } from '../controllers/TripController';
import activityRoutes from './activityRoutes';

const router = Router();
const tripController = new TripController();

router.post('/', (req, res, next) => tripController.createTrip(req, res, next));
router.get('/recent', (req, res, next) => tripController.getRecentTrips(req, res, next));
router.get('/:tripId', (req, res, next) => tripController.getTripById(req, res, next));
router.put('/:tripId', (req, res, next) => tripController.updateTrip(req, res, next));
router.delete('/:tripId', (req, res, next) => tripController.deleteTrip(req, res, next));
router.use('/:tripId/activities', activityRoutes);

export default router;