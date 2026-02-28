import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import connectDb  from './configs/db.js';
import { inngest, functions } from './Inggest/index.js';
import { serve } from 'inngest/express';
import userRouter from './routes/userRoutes.js';

const app = express();

const dbConnected = await connectDb();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get('/', (req,res)=> res.json({ message: 'server is running', dbConnected }))
app.get('/health', (req, res) =>
  res.json({
    ok: true,
    dbConnected,
    mongoReadyState: dbConnected ? 'connected' : 'disconnected',
  })
);
app.use('/api/inngest', serve({client: inngest, functions}))
app.use('/api/user', userRouter)

const PORT = process.env.PORT || 4000;


app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`))
