import express from 'express';
import {
    registerUser_get,
    registerUser_post,
    loginUser_get,
    loginUser_post,
    logoutUser_get,
    logoutUser_post,
    profileUser_get,
    getAdminUser_post
} from '../controllers/userController.js';

const router = express.Router();

router.get('/user_register', registerUser_get);
router.post('/user_register', registerUser_post);

router.get('/user_login', loginUser_get);
router.post('/user_login', loginUser_post);

router.get('/user_logout', logoutUser_get);
router.post('/user_logout', logoutUser_post);

router.get('/user_profile', profileUser_get);

router.post('/user_get_admin', getAdminUser_post);

export default router;