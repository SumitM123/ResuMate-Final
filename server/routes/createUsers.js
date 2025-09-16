//import router from 'express';
import User from '../models/User.js'; // Adjust path as needed
import mongoose from 'mongoose';
import express from 'express';
import DocumentModel from '../models/Documents.js';
import {S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand, BucketAlreadyExists, CreateBucketCommand, waitUntilBucketExists} from '@aws-sdk/client-s3';
import multer from 'multer';
import fs from 'fs';
import path, { dirname } from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config({ path: '../config.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  //credentials for my IAM user account
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../lib/cloud')); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/uploadFiles', 
    upload.fields([
        { name: 'originalResume', maxCount: 1 },
        { name: 'parsedOutputResume', maxCount: 1 }
    ]), 
    async (req, res) => {
        const { googleID, jobDescription } = req.body;

        //let outputResumeFile;
        let uniqueKeyPrefix = Date.now() + '-';
        // axios.get(parsedResumeURL, { responseType: 'arraybuffer' })
        // .then(response => {
        //     uniqueKeyPrefix = Date.now() + '-';
        //     const filePath = path.join(__dirname, '../uploads/cloud', "parsedOutputResume.pdf");
        //     fs.writeFileSync(filePath, response.data); // Save PDF to disk <- MIGHT HAVE TO BE ASYNC
        // }).catch(error => {
        //     console.error("Error fetching parsed resume PDF:", error);
        //     return res.status(500).json({ success: false, message: 'Error fetching parsed resume PDF' });
        // });


        //const pathToOriginalResume = path.join(__dirname, '../uploads/cloud', 'originalResume.pdf');
        //const pathToParsedResume = path.join(__dirname, '../uploads/cloud', "parsedOutputResume.pdf");

        const pathToOriginalResume = req.files['originalResume'][0].path;
        const pathToParsedResume = req.files['parsedOutputResume'][0].path;
        
        const resumeKey = uniqueKeyPrefix + 'originalResume.pdf';
        const parsedResumeKey = uniqueKeyPrefix + "parsedOutputResume.pdf";
        try {
            const sendingOriginalFile = await s3Client.send(new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_ORIGINAL_RESUME,
                Key: resumeKey,
                Body: await readFile(pathToOriginalResume)
            }));
        } catch (err) {
            console.error("Error uploading original resume to S3:", err);
            return res.status(500).json({ success: false, message: 'Error uploading original resume to S3' });
        }
        try {
            const sendingParsedFile = await s3Client.send(new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_OUTPUT_PARSED_RESUME,
                Key: parsedResumeKey,
                Body: await readFile(pathToParsedResume)
            }));
        } catch (err) {
            console.error("Error uploading parsed resume to S3:", err);
            return res.status(500).json({ success: false, message: 'Error uploading parsed resume to S3' });
        }
        

        //URL of the object: https://<bucket-name>.s3.<region>.amazonaws.com/<object-key> <- Not doing this approach cause then we have to make it public

        //save the keys to mongodb
        /* 
            1) Create a document of the past query
            2) Insert into the rightful Document
        */

        //checking if user exists inside of the user collection
        if(!(await checkIfUserExists(googleID))) {
            return res.status(400).json({ success: false, message: 'User does not exist' });
        }

        try {
           //when returning a promise, it means either resolving or rejecting
           const document = await DocumentModel.findOne({ googleID: googleID });
           if (document) {
                document.pastQueries.push({resume: resumeKey, JobDescription: jobDescription, parsedResume: parsedResumeKey});
                await document.save();
           } else {
                //might have to delete this else statement because we're creating the document model to new user through getAllDocuments route <- DO THIS LATER
                //instead, might have to throw an error
                const newDoc = new DocumentModel({
                    googleID: googleID,
                    pastQueries: [{
                        resume: resumeKey,
                        JobDescription: jobDescription,
                        parsedResume: parsedResumeKey
                    }]
                });
                await newDoc.save();
           }
        } catch (err) {
            console.error("Error saving document to MongoDB:", err);
            return res.status(500).json({ success: false, message: 'Error saving document to MongoDB' });
        }

       fs.unlink(pathToOriginalResume, (err) => {
            if (err) {
                console.error("Error deleting original resume file:", err);
            }
        });
        fs.unlink(pathToParsedResume, (err) => {
            if (err) {
                console.error("Error deleting parsed resume file:", err);
            }
        }); 

       return res.status(200).json({ success: true, message: 'Files uploaded and document saved successfully' });
});

const createBucket = async (bucketName) => {
    try {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    } catch (err) {
        if (err instanceof BucketAlreadyExists) {
            console.log("Bucket already exists. Choose a different name.");
        } else {
            console.error("Error creating bucket:", err);
        }
        return;
    }
    await waitUntilBucketExists({ client: s3Client}, { Bucket: bucketName });
    console.log("Bucket created successfully");
};
const checkIfUserExists = async (googleID) => {
    try {
        const userToFind = await User.findOne({ googleId: googleID });
        if(!userToFind) {
            throw new Error("User not found");
        }
    } catch (err) {
        console.error("Error finding user in MongoDB:", err);
        return false;
    }
}
router.get('/getAllDocuments/:googleID', async (req, res) => {
    const { googleID } = req.params;
    /*
        1) find the document associated with the googleID
        2)  a) Interate through the pastQueries array and get the signed URL for each resume and parsed resume
            b) For each pastQuery element is an element in the drop down. And each element is associated with the
                respective job description and URLS
            
    */
    //find the document associated with the googleID


    //EACH DOCUMENT MODEL IS UNIQUE BY GOOGLEID
    //EACH PAST QUERY IS UNIQUE BY DATE
        //ONE FOR ORIGINAL RESUME
        //ONE FOR PARSED OUTPUT RESUME
    
    //This will return the Resume Key, job description, and Parsed Resume Key for all the past queries
    //each object is a past query
    if(!(await checkIfUserExists(googleID))) {
        return res.status(400).json({ success: false, message: 'User does not exist' });
    }

    let listOfPastQueries = [];
    try {
        const pastQueryDocuments = await DocumentModel.findOne({ googleID : googleID});
        if (pastQueryDocuments) {
            for(let i = 0; i < pastQueryDocuments.pastQueries.length; i++) {
                const currentQuery = pastQueryDocuments.pastQueries[i];
                let originalResumeKey = currentQuery.get('resume');
                let jobDescription = currentQuery.get('JobDescription');
                let parsedResumeKey = currentQuery.get('parsedResume');
                listOfPastQueries.push({
                    originalResumeKey: originalResumeKey,
                    jobDescription: jobDescription,
                    parsedResumeKey: parsedResumeKey
                });
            }
        } else {
            const newDoc = new DocumentModel({
                googleID: googleID,
                pastQueries: []
            });
            await newDoc.save();
        }
    } catch (error) {
        console.error("Error fetching documents:", error);
        return res.status(500).json({ success: false, message: 'Error fetching documents' });
    }
    return res.status(200).json({ success: true, pastQueries: listOfPastQueries, message: " Past queries found" });
});

router.get('/specificDocument/:googleID?originalResumeURL', async (req, res) => {
    const { googleID } = req.params;
    const { originalResumeURL} = req.query;
    /*
    c) When the user clicks on the element, create a GetObject request in which it'll provide the files associated
               with the URLs and the job description
            d) Send the files and the job description to the client as a blob
            d) Display the files and the job description on the page <- This is done on the client side */
    if(!(await checkIfUserExists(googleID))) {
        return res.status(400).json({ success: false, message: 'User does not exist' });
    }
    //objects with .body, and Content-Type
    let originalResumeStream;;
    try {
        originalResumeStream = await s3Client.send(new GetObjectCommand({
            bucket: process.env.AWS_S3_BUCKET_ORIGINAL_RESUME,
            key: originalResumeURL
        }));
    } catch (error) {
        console.error("Error fetching original resume from S3:", error);
        return res.status(500).json({ success: false, message: 'Error fetching original resume from S3', error });
    }

    const writeDirectory = path.join(__dirname, '../lib/client');
    fs.writeFileAsync(path.join(writeDirectory, 'originalResumeToClient.pdf'), originalResumeStream.Body);
    res.sendFile(path.join(writeDirectory, 'originalResumeToClient.pdf'), (err) => {
        if (err) {
            console.error("Error sending original resume file:", err);
            return res.status(500).json({ success: false, message: 'Error sending original resume file', error: err });
        }
    });
    fs.unlink(path.join(writeDirectory, 'originalResumeToClient.pdf'), (err) => {
        if (err) {
            console.error("Error deleting original resume file:", err);
        }
    });
    
});
router.get('/specificDocument/:googleID?parsedResumeURL', async (req, res) => {
    const { googleID } = req.params;
    const { parsedResumeURL} = req.query;
     if(!(await checkIfUserExists(googleID))) {
        return res.status(400).json({ success: false, message: 'User does not exist' });
    }
    //objects with .body, and Content-Type
    let parsedResumeStream;
     try {
        parsedResumeStream = await s3Client.send(new GetObjectCommand({
            bucket: process.env.AWS_S3_BUCKET_OUTPUT_PARSED_RESUME,
            key: parsedResumeURL
        }));
    } catch (error) {
        console.error("Error fetching parsed resume from S3:", error);
        return res.status(500).json({ success: false, message: 'Error fetching parsed resume from S3', error });
    }
    const writeDirectory = path.join(__dirname, '../lib/client');
    fs.writeFileAsync(path.join(writeDirectory, 'parsedResumeToClient.pdf'), parsedResumeStream.Body);
    res.sendFile(path.join(writeDirectory, 'parsedResumeToClient.pdf'), (err) => {
        if (err) {
            console.error("Error sending parsed resume file:", err);
            return res.status(500).json({ success: false, message: 'Error sending parsed resume file', error: err });
        }
    });
    fs.unlink(path.join(writeDirectory, 'parsedResumeToClient.pdf'), (err) => {
        if (err) {
            console.error("Error deleting parsed resume file:", err);
        }
    });
});

// router.get('/')
export default router;