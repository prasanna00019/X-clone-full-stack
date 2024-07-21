import express from "express"
import { protectRoute } from "../middleware/protectRoute.js";
import { commentOnPost, createPost, deletePost, getAllPosts, getFollowingPosts, getLikedPosts, getUserPosts, likeUnlikePost } from "../controllers/postController.js";
const router=express.Router();
router.post('/create',protectRoute,createPost);
router.get("/likes/:id",protectRoute,getLikedPosts);
router.get('/following',protectRoute,getFollowingPosts)
router.delete('/:id',protectRoute,deletePost);
router.post('/like/:id',protectRoute,likeUnlikePost);
router.post('/comment/:id',protectRoute,commentOnPost);
router.get('/user/:username',protectRoute,getUserPosts);
router.get('/all',protectRoute,getAllPosts);
export default router;
