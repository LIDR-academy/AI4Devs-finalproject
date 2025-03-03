import app from './app';
import { config } from 'dotenv';

// Load environment variables
config();

const PORT = process.env.PORT || 3001;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
