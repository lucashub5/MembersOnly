import asyncHandler from 'express-async-handler';
import Message from '../models/message.js';
import { validationResult, body } from 'express-validator';
import User from '../models/user.js';

export const messages_get = asyncHandler(async (req, res, next) => {
    const message = req.query.message;
    const allMessages = await Message.find().populate('author', 'first_name admin member_status').sort({ date: -1 });

    res.render("messages", {
        title: "Messages",
        message,
        messages_list: allMessages,
        user: req.user
    });
});

const validateMessage = [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('text').trim().notEmpty().withMessage('Text is required.')
];

export const message_send_post = [
    ...validateMessage,
    asyncHandler(async (req, res, next) => {
        const { title, text } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const newMessage = new Message({
            title,
            text,
            author: req.user._id
        });

        await newMessage.save();

        res.redirect('/messages/?message=messageSuccess');
    })
];

export const validateMember = [
    body('member_code').trim().isLength({ min: 5, max: 5 }).withMessage('Member code must be at least 5 characters long.'),
];

export const get_member_status_post = [
    ...validateMember,
    asyncHandler(async (req, res, next) => {
        const { member_code } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (member_code !== 'HAPPY') {
            return res.redirect('/messages/?message=member_status_failed')
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ errors: [{ msg: 'User not found.' }] });
        }

        user.member_status = true;

        await user.save();

        return res.redirect('/messages/?message=member_status_success');
    })
];

