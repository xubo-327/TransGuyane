const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const users = [
    {
        username: 'admin',
        password: 'admin123',
        role: 'superadmin',
        nickname: '超级管理员'
    },
    {
        username: 'xubo327',
        password: '3273279x',
        role: 'admin',
        nickname: '普通管理员'
    },
    {
        username: 'zhousuda',
        password: '20260101',
        role: 'admin',
        nickname: '普通管理员'
    }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/warehouse_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('MongoDB Connected...');

        for (const user of users) {
            try {
                // Check if user exists
                const existingUser = await User.findOne({ username: user.username });

                if (existingUser) {
                    // Update password and role if exists (in case it was wrong)
                    existingUser.password = user.password;
                    existingUser.role = user.role;
                    existingUser.nickname = user.nickname;
                    await existingUser.save(); // User model pre-save hook will hash password
                    console.log(`Updated user: ${user.username}`);
                } else {
                    // Create new user
                    const newUser = new User(user);
                    await newUser.save();
                    console.log(`Created user: ${user.username}`);
                }
            } catch (err) {
                console.error(`Error processing user ${user.username}:`, err);
            }
        }

        console.log('Done.');
        process.exit(0);
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
