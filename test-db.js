const connectDB = require('./config/database');

async function testConnection() {
    try {
        await connectDB();
        console.log('✅ Connection test completed successfully!');
        
        // Exit after successful test
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    } catch (error) {
        console.error('❌ Connection test failed:', error);
        process.exit(1);
    }
}

testConnection(); 