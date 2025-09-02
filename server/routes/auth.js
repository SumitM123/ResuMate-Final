import express from 'express';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

dotenv.config({ path: "./config.env" });

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        
        const userInfo = {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture
        };

        let existingUser = await User.findOne({ googleId: userInfo.googleId });

        if (!existingUser) {
            existingUser = await User.create(userInfo);
        }
        
        res.status(200).json(userInfo);
    } catch (error) {
        console.log(`Error message: ${error}`);
        res.status(401).json({ error: "Invalid token" });
    }
});

export default router;
