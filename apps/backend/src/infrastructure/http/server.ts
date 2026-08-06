import { createApp } from './app.js';
import { getEnvironment } from '../config/environment.js';

const env = getEnvironment();
const app = createApp();

app.listen(env.PORT, () => {
  console.log(`🚀 RestoStock Backend corriendo en http://localhost:${env.PORT} en modo [${env.NODE_ENV}]`);
});
