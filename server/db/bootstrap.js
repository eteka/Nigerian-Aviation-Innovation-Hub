require('dotenv').config();
const db = require('./index');
const { runMigrations } = require('./migrations');

async function bootstrap() {
  try {
    console.log('Bootstrapping database...');
    
    // Run migrations
    await runMigrations(db);
    
    console.log('Database bootstrap completed successfully');
    
    // Don't close the connection - let the app use it
    return db;
  } catch (error) {
    console.error('Database bootstrap failed:', error);
    throw error;
  }
}

// If run directly, bootstrap and exit
if (require.main === module) {
  bootstrap()
    .then(() => {
      console.log('Bootstrap script completed');
      if (db.client === 'pg') {
        db.close().then(() => process.exit(0));
      } else {
        db.close();
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('Bootstrap script failed:', error);
      process.exit(1);
    });
}

module.exports = { bootstrap };
