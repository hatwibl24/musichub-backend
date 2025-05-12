const cloudinary = require('./config/cloudinary');

async function testCloudinary() {
    try {
        // Test Cloudinary connection
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary Connection Test: PASSED');

        // Test folder creation
        await Promise.all([
            cloudinary.api.create_folder('profile-photos'),
            cloudinary.api.create_folder('songs'),
            cloudinary.api.create_folder('covers')
        ]);
        console.log('✅ Folder Creation Test: PASSED');

        // Get account details
        const account = await cloudinary.api.usage();
        console.log('✅ Account Status:', {
            plan: account.plan,
            credits: account.credits,
            storage: {
                used: Math.round(account.storage.used / 1024 / 1024) + ' MB',
                total: Math.round(account.storage.allowed / 1024 / 1024) + ' MB'
            }
        });

        console.log('\n🎉 All Cloudinary tests passed successfully!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testCloudinary(); 