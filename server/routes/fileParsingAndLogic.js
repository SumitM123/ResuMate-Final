const express = require('express');
const router = express.Router();
const fs = require("fs");
require("dotenv").config({ path: "./config.env" });
const { AffindaAPI, AffindaCredential } = require('@affinda/affinda');

const credential = new AffindaCredential(process.env.AFFINDA_API_KEY);
const affClient = new AffindaAPI(credential);

const fileStream = fs.createReadStream()
//this request is made by loadingPage
router.post('/', async (req, res) => {
    try {
        // The client is sending JSON with payload containing file data
        const fileData = req.body.payload;
        const fileStream = fs.createReadStream(fileData)
        if (!fileData) {
            return res.status(400).json({ error: 'No file data received' });
        }
        
        console.log('File data received:', fileData);
        
        // Convert the file data to a buffer for Affinda API
        const fileBuffer = Buffer.from(fileData, 'base64');
        
        // Upload document to Affinda for parsing
        const response = await affClient.createDocument({
            file: fileBuffer,
            fileName: 'resume.pdf'
        });
        
        console.log('Affinda response:', response);
        
        // Return the parsed document data
        res.status(200).json({
            success: true,
            message: 'Document parsed successfully',
            data: response
        });
        
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error processing request: ' + error.message 
        });
    }
});

module.exports = router;