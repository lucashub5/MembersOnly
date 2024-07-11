import express from 'express';
import { messages_get,
    message_send_post,
    get_member_status_post
 } from '../controllers/messagesController.mjs';

const router = express.Router();

router.get('/', messages_get);

router.post('/send_message', message_send_post);

router.post('/get_member_status', get_member_status_post);

export default router;
