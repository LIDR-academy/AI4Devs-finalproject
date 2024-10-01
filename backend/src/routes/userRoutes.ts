import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();
const userController = new UserController();

router.get("/:id", (req, res, next) => userController.getUserById(req, res, next));
router.get("/", (req, res, next) => userController.getUserBySessionId(req, res, next));
router.post("/", (req, res, next) => userController.createUser(req, res, next));

export default router;