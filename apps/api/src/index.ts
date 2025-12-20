import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth';
import authMerchantRoutes from './routes/auth.merchant';
import authPartnerRoutes from './routes/auth.partner';
import merchantRoutes from './routes/merchants';
import merchantMeRoutes from './routes/merchant.me';
import partnerMeRoutes from './routes/partner.me';
import partnerMerchantsRoutes from './routes/partner.merchants';
import partnerContextRoutes from './routes/partner.context';
import partnerUsersRoutes from './routes/partner.users';
import transactionRoutes from './routes/transactions';
import stripeRoutes from './routes/stripe';
import revenueSplitRoutes from './routes/revenueSplit';
import payoutRoutes from './routes/payouts';
import dashboardRoutes from './routes/dashboard';
import reportRoutes from './routes/reports';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS Configuration
// Get allowed origin from environment variable or default to frontend URL
const WEB_ORIGIN = process.env.WEB_ORIGIN || 'http://localhost:3000';

// CORS Middleware - must be before routes
app.use(
  cors({
    origin: WEB_ORIGIN,
    credentials: false, // We use Authorization header, not cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [],
    maxAge: 86400, // 24 hours
  })
);

// Stripe webhook needs raw body for signature verification
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON body parser for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'merchant-app-api'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', authMerchantRoutes);
app.use('/api/auth', authPartnerRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/merchant', merchantMeRoutes);
app.use('/api/partner', partnerMeRoutes);
app.use('/api/partner', partnerMerchantsRoutes);
app.use('/api/partner', partnerContextRoutes);
app.use('/api/partner/users', partnerUsersRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/revenue-split', revenueSplitRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   POST   /api/auth/merchant/register - Register new merchant + owner`);
  console.log(`   POST   /api/auth/merchant/login - Login merchant user`);
  console.log(`   POST   /api/auth/partner/register - Register new partner + owner`);
  console.log(`   POST   /api/auth/partner/login - Login partner user`);
  console.log(`   POST   /api/auth/register/merchant`);
  console.log(`   POST   /api/auth/register/partner`);
  console.log(`   POST   /api/auth/login/merchant`);
  console.log(`   POST   /api/auth/login/partner`);
  console.log(`   POST   /api/auth/refresh`);
  console.log(`   GET    /api/auth/me`);
    console.log(`   GET    /api/merchant/me - Get logged-in merchant user`);
    console.log(`   GET    /api/partner/me - Get logged-in partner user`);
    console.log(`   GET    /api/partner/merchants - List merchants linked to partner`);
    console.log(`   GET    /api/partner/context?merchantId=UUID - Get merchant context`);
  console.log(`   GET    /api/merchants/me`);
  console.log(`   GET    /api/merchants/:merchantId`);
  console.log(`   PUT    /api/merchants/me`);
  console.log(`   GET    /api/transactions/merchant`);
  console.log(`   GET    /api/transactions/merchant/:merchantId`);
  console.log(`   POST   /api/transactions`);
  console.log(`   POST   /api/stripe/connect`);
  console.log(`   GET    /api/stripe/account`);
  console.log(`   POST   /api/stripe/sync`);
  console.log(`   POST   /api/stripe/webhook`);
  console.log(`   GET    /api/stripe/sync/status`);
});

