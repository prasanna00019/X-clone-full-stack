import express from "express"
import { protectRoute } from "../middleware/protectRoute.js";
import { DeleteNotification, DeleteNotifications, getNotifications } from "../controllers/NotificationController.js";
const router=express.Router();
router.get('/',protectRoute,getNotifications);
router.delete('/',protectRoute,DeleteNotifications)
router.delete('/:id',DeleteNotification);
export default router;