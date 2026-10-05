import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './route/auth.route.js';
import entryRouter from './route/entry.route.js';

const app = express();

app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(cookieParser());


// Routes
app.use('/api/auth', authRouter);
app.use('/api/entries', entryRouter);

export default app;