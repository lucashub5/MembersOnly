import express from 'express';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcryptjs';

import userRoutes from './routes/users.mjs';
import indexRoute from './routes/index.mjs';
import messagesRoutes from './routes/messages.mjs';
import User from './models/user.mjs';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const mongoDB = process.env.MONGODB_URI;

const main = async () => {
    try {
        await mongoose.connect(mongoDB, { dbName: 'db_member_only' });
        console.log('MongoDB connected');
    } catch {
        console.log('Error connecting to MongoDB')
    }
}

main();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (username, password, done) => {
      try {
          const user = await User.findOne({ email: username });
          if (!user) {
              return done(null, false, { message: 'Incorrect email or password.' });
          }
  
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
              return done(null, false, { message: 'Incorrect email or password.' });
          }
          return done(null, user);
      } catch (error) {
          return done(error);
      }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, false);
    }
});

app.use('/', indexRoute);
app.use('/users', userRoutes);
app.use('/messages', messagesRoutes);

export default app;



