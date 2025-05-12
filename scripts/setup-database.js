import { initializeDatabase } from '../js/init-database.js';
import { setupFirebaseIndexes } from './setup-firebase.js';

async function setupDatabase() {
    try {
        console.log('Starting database setup...');

        // Step 1: Initialize the database
        console.log('\nStep 1: Initializing database...');
        const initResult = await initializeDatabase();
        if (!initResult.success) {
            throw new Error(`Database initialization failed: ${initResult.error}`);
        }
        console.log('Database initialized successfully');

        // Step 2: Setup Firebase indexes
        console.log('\nStep 2: Setting up Firebase indexes...');
        const indexResult = await setupFirebaseIndexes();
        if (!indexResult.success) {
            throw new Error(`Index setup failed: ${indexResult.error}`);
        }
        console.log('Firebase indexes setup completed');

        // Step 3: Instructions for manual steps
        console.log('\nStep 3: Manual steps required:');
        console.log('1. Go to your Firebase Console');
        console.log('2. Navigate to Firestore Database');
        console.log('3. Go to the "Indexes" tab');
        console.log('4. Create the composite indexes as shown above');
        console.log('5. Navigate to "Rules" tab');
        console.log('6. Copy the contents of firebase.rules file and paste them in the rules editor');
        console.log('7. Click "Publish" to apply the security rules');

        console.log('\nDatabase setup completed successfully!');
        return { success: true };
    } catch (error) {
        console.error('Error during database setup:', error);
        return { success: false, error: error.message };
    }
}

// Run the setup
setupDatabase().then(result => {
    if (!result.success) {
        console.error('Database setup failed:', result.error);
        process.exit(1);
    }
}); 