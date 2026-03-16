import { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController';

const router = Router({ mergeParams: true });
const activityController = new ActivityController();

router.post('/', (req, res, next) => activityController.createActivity(req, res, next));
router.post('/all', (req, res, next) => activityController.updateActivities(req, res, next));
router.get('/', (req, res, next) => activityController.getActivitiesByTripId(req, res, next));
router.get('/:id', (req, res, next) => activityController.getActivityById(req, res, next));
router.put('/:id', (req, res, next) => activityController.updateActivity(req, res, next));
router.delete('/:id', (req, res, next) => activityController.deleteActivity(req, res, next));

export default router;