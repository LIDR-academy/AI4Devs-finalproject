import { AppDataSource } from './data-source';

beforeAll(async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
    } catch (error) {
        console.error('Error during Data Source initialization:', error);
        throw error;
    }
});

afterAll(async () => {
    try {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    } catch (error) {
        console.error('Error during Data Source destruction:', error);
    }
});