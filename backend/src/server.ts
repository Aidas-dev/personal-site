import express from 'express';

const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'riedu-eshop-backend' });
});

// Placeholder API routes
app.get('/api/store/products', (req, res) => {
  res.json({ products: [] });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
