const express = require('express');
const router = express.Router();
const { User } = require('../models/init-db');
const auth = require('../middleware/auth');

// Get user profile
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { username, email, bio, location, website } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = username || user.username;
        user.email = email || user.email;
        user.profile.bio = bio || user.profile.bio;
        user.profile.location = location || user.profile.location;
        user.profile.website = website || user.profile.website;

        await user.save();
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user followers
router.get('/:id/followers', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('followers', '-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.followers);
    } catch (error) {
        console.error('Error getting followers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user following
router.get('/:id/following', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('following', '-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.following);
    } catch (error) {
        console.error('Error getting following:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Follow a user
router.post('/:id/follow', auth, async (req, res) => {
    try {
        // Can't follow yourself
        if (req.userId === req.params.id) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.userId);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already following
        if (currentUser.following.includes(req.params.id)) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Update both users
        currentUser.following.push(req.params.id);
        userToFollow.followers.push(req.userId);

        await currentUser.save();
        await userToFollow.save();

        res.json({ message: 'Successfully followed user' });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Unfollow a user
router.post('/:id/unfollow', auth, async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.userId);

        if (!userToUnfollow || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove from following/followers
        currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
        userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.userId);

        await currentUser.save();
        await userToUnfollow.save();

        res.json({ message: 'Successfully unfollowed user' });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 