import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import leadRoutes from './routes/leads';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// List of allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://lead-manage-two.vercel.app',
  'https://lead-manage-23w81bhfp-sumits-projects-18000165.vercel.app',
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: any, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);

    // Allow localhost for dev
    if (origin.startsWith('http://localhost:')) return callback(null, true);

    // Allow all deployments under *.vercel.app for your project
    if (origin.endsWith('.vercel.app')) return callback(null, true);

    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};


app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight

// Middleware
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  // console.log(`🌐 Allowed Origins:`, allowedOrigins);
});
