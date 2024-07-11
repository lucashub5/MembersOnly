import User from '../models/user.js';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import passport from 'passport';

export const registerUser_get = asyncHandler(async (req, res, next) => {
    const { error } = req.query;
    let message = '';

    if (error === 'passwordMismatch') {
      message = 'passwordMismatch';
    } else if (error === 'alreadyexists') {
      message = 'User already exists';
    }
  
    res.render("user_register", {
      title: "User Register",
      message
    });
})

const userValidators = [
    body('first_name').trim().isLength({ min: 1, max: 20 }).withMessage('First Name must be between 1 and 20 characters'),
    body('last_name').trim().isLength({ min: 1, max: 20 }).withMessage('Last Name must be between 1 and 20 characters'),
    body('email').trim().isEmail().withMessage('Invalid email format').isLength({ max: 50 }).withMessage('Email must not exceed 50 characters'),
    body('password').isLength({ min: 6, max: 30 }).withMessage('Password must be between 6 and 30 characters'),
    body('confirm_password').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

export const registerUser_post = [
    ...userValidators,
    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const queryParams = new URLSearchParams({ error: 'passwordMismatch' }).toString();
        res.redirect(`/users/user_register?${queryParams}`);
        return;
      }
  
      const { first_name, last_name, email, password } = req.body;
  
      const userExists = await User.findOne({ email });
  
      if (userExists) {
        res.redirect('/users/user_register/?error=alreadyexists');
        return;
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newUser = await User.create({
        first_name,
        last_name,
        email,
        password: hashedPassword,
      });
  
      if (newUser) {
        res.redirect('/users/user_login/?message=success');
      } else {
        res.status(400);
        throw new Error('Failed to create user');
      }
    }),
];

export const loginUser_get = asyncHandler(async (req, res, next) => {
    const message = req.query.message;
    let message_desc = '';
    if (message === 'register_done') message_desc = 'User created successfully. Log in to start session.';
    if (message === 'failure') message_desc = 'Incorrect credentials.'

    res.render("user_login", { 
        title: "User Login",
        message,
        message_desc
    });
});

const loginValidators = [
    body('email').trim().isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6, max: 30 }).withMessage('Password must be between 6 and 30 characters'),
];

export const loginUser_post = [
  ...loginValidators,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = errors.array().map(error => error.msg);
      return res.render('user_login', {
        title: 'User Login',
      });
    }

    passport.authenticate('local', {
      successRedirect: '/messages/?message=success',
      failureRedirect: '/users/user_login/?message=failure'
    })(req, res, next);
  })
];

export const logoutUser_get = asyncHandler(async (req, res, next) => {
  res.render("user_logout", { 
    title: "Signing out from the account:",
    user: req.user
  });
});

export const logoutUser_post = asyncHandler(async (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/messages/?message=logout');
  });
});

export const profileUser_get = asyncHandler(async (req, res, next) => {
  const message = req.query.message;
  
  res.render("user_profile", { 
    user: req.user,
    message
  });
});

export const validateAdmin = [
  body('admin_code').trim().isLength({ min: 0, max: 50 }).withMessage('Invalid.'),
];

export const getAdminUser_post = [
  ...validateAdmin,
  asyncHandler(async (req, res, next) => {
      const { admin_code } = req.body;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }

      if (admin_code !== '123kio@') {
          return res.redirect('/users/user_profile/?message=admin_failed')
      }

      const user = await User.findById(req.user._id);

      if (!user) {
          return res.status(404).json({ errors: [{ msg: 'User not found.' }] });
      }

      user.admin = true;

      await user.save();

      return res.redirect('/users/user_profile/?message=admin_success');
  })
];

