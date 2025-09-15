//import router from 'express';
import User from '../models/User.js'; // Adjust path as needed
import mongoose from 'mongoose';
import express from 'express';
import {DocumentModel, PastQueryModel} from '../models/Documents.js';
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
        const { googleID, jobDescription, parsedResumeURL } = req.body;

        //let outputResumeFile;
        let uniqueKeyPrefix;
        axios.get(parsedResumeURL, { responseType: 'arraybuffer' })
        .then(response => {
            uniqueKeyPrefix = Date.now() + '-';
            const filePath = path.join(__dirname, '../uploads/Cloud', "parsedOutputResume.pdf");
            fs.writeFileSync(filePath, response.data); // Save PDF to disk <- MIGHT HAVE TO BE ASYNC
        }).catch(error => {
            console.error("Error fetching parsed resume PDF:", error);
            return res.status(500).json({ success: false, message: 'Error fetching parsed resume PDF' });
        });

        const pathToOriginalResume = path.join(__dirname, '../uploads/Cloud', 'originalResume.pdf');
        const pathToParsedResume = path.join(__dirname, '../uploads/Cloud', "parsedOutputResume.pdf");

        const resumeKey = uniqueKeyPrefix + 'originalResume.pdf';
        const parsedResumeKey = uniqueKeyPrefix + "parsedOutputResume.pdf";
        try {
            const sendingOriginalFile = await s3Client.send(new PutObjectCommand({
                Bucket: 'resumate-documents-storage-cloud-original-resume',
                Key: resumeKey,
                Body: await readFile(pathToOriginalResume)
            }));
        } catch (err) {
            console.error("Error uploading original resume to S3:", err);
            return res.status(500).json({ success: false, message: 'Error uploading original resume to S3' });
        }
        try {
            const sendingParsedFile = await s3Client.send(new PutObjectCommand({
                Bucket: 'resumate-documents-storage-cloud-output-parsed-resume',
                Key: parsedResumeKey,
                Body: await readFile(pathToParsedResume)
            }));
        } catch (err) {
            console.error("Error uploading parsed resume to S3:", err);
            return res.status(500).json({ success: false, message: 'Error uploading parsed resume to S3' });
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

        //URL of the object: https://<bucket-name>.s3.<region>.amazonaws.com/<object-key> <- Not doing this approach cause then we have to make it public

        //save the keys to mongodb
        /* 
            1) Create a document of the past query
            2) Insert into the rightful Document
        */
       try {
           const userToUpload = await DocumentModel.find({ googleID: googleID });
            await userToUpload.push({resume: resumeKey, JobDescription: jobDescription, parsedResume: parsedResumeKey});
            await DocumentModel.save();
       } catch (err) {
            console.error("Error saving document to MongoDB:", err);
            return res.status(500).json({ success: false, message: 'Error saving document to MongoDB' });
       }
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
// router.get('/getDocuments/:googleID', async (req, res) => {
//     const { googleID } = req.params;
    
// });
// //you run this in the output page after the file is parsed and the pdf and latex content is ready
// router.post('/addDocuments', async (req, res) => {
    
//     const { formData } = req.body;
    
// });
export default router;