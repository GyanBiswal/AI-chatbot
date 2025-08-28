import express from 'express';
import cookieParser from 'cookie-parser';


import authRoutes from './routes/auth.routes.js'
import chatRoutes from './routes/chat.routes.js'

const app = express();

/* middlewares */
app.use(express.json());
app.use(cookieParser());

/* Routes */ 
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

export default app;