import bcrypt from 'bcrypt';
import cors from 'cors';
import express from 'express';
import mockUsers from './users.mock';

/**
 * Creates a mock Express app for integration tests
 */
export const createMockExpressApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }));

  // Login endpoint for testing
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    try {
      const passwordMatches = await bcrypt.compare(password, user.password);
      
      if (!passwordMatches) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      const token = 'demo-token-' + Date.now();
      
      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  });

  return app;
};

export default createMockExpressApp; 