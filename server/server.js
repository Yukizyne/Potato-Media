import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDb  from './configs/db';
import { inngest, functions } from './Inggest/index.js';
import { serve } from 'inngest/express';

const app = express();

await connectDb();

app.use(express.json());
app.unsubscribe(cors());

app.get('/', (req,res)=> res.send('server is running'))
app.use('/api/inngest', serve({client: inngest, functions}))

const PORT = process.env.PORT || 4000;


app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`))