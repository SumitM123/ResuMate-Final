//import router from 'express';
import User from '../models/User.js'; // Adjust path as needed
import mongoose from 'mongoose';
import express from 'express';
import DocumentModel from '../models/Documents.js';
import {S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand, BucketAlreadyExists, CreateBucketCommand, waitUntilBucketExists} from '@aws-sdk/client-s3';

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
        cb(null, '../uploads/Cloud'); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, "originalResume");
    }
});
const upload = multer({ storage: storage });

router.post('/uploadFiles', 
    upload.single('originalResume'), 
    async (req, res) => {
        const { jobDescription, parsedResumeURL } = req.body;

        //let outputResumeFile;
        axios.get(parsedResumeURL, { responseType: 'arraybuffer' })
        .then(response => {
            const parsedFileName = Date.now() + '-parsedResume.pdf';
            const filePath = path.join(__dirname, '../uploads/Cloud', parsedFileName);
            fs.writeFileSync(filePath, response.data); // Save PDF to disk <- MIGHT HAVE TO BE ASYNC
        }).catch(error => {
            console.error("Error fetching parsed resume PDF:", error);
            return res.status(500).json({ success: false, message: 'Error fetching parsed resume PDF' });
        });
        //create buckets
        try {
            await createBucket('resumate-documents-storage-cloud-original-resume');
        } catch (err) {
            console.error("Error creating original resume bucket :", err);
            return res.status(500).json({ success: false, message: 'Error creating S3 bucket' });
        }
        try {
            await createBucket('resumate-documents-storage-cloud-output-parsed-resume');
        } catch (err) {
            console.error("Error creating parsed resume bucket :", err);
            return res.status(500).json({ success: false, message: 'Error creating S3 bucket' });
        }

        //upload files to s3


        //Right now you have the original resume with the name "originalResume" in the uploads/Cloud folder
        //You have the parsed resume in the uploads/Cloud folder with the name stored in parsedFileName
        
        
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
// router.get('/getDocuments/:googleID', async (req, res) => {
//     const { googleID } = req.params;
    
// });
// //you run this in the output page after the file is parsed and the pdf and latex content is ready
// router.post('/addDocuments', async (req, res) => {
    
//     const { formData } = req.body;
    
// });
export default router;