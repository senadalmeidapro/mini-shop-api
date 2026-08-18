import app from './app.ts';
import { AppDataSource } from './config/database.ts';

AppDataSource.initialize()
  .then(() => {
    console.log('Database initialized');

    app.listen(3000, () => {
      console.log('Server start on http://localhost:3000');
    });
  })
  .catch((error) => {
    console.log(`Database connection failed ${error}`);
  });
