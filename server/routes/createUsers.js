//import router from 'express';
import User from '../models/User.js'; // Adjust path as needed
import mongoose from 'mongoose';
import express from 'express';
import DocumentModel from '../models/Documents.js';

import { S3CClient, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3CClient({});

const router = new express.Router();

router.post('/addUser', async (req, res) => { 
    const { googleId, email, name} = req.body;
    const newUser = new User({
        googleId: googleId,
        email: email,
        name: name
    })
    try {
        await newUser.save();
        res.status(201).json({ success: true, message: 'User added successfully' });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/getDocuments/:googleID', async (req, res) => {
    const { googleID } = req.params;
    
});
//you run this in the output page after the file is parsed and the pdf and latex content is ready
router.post('/addDocuments', async (req, res) => {
    
    const { formData } = req.body;
    
});
export default router;