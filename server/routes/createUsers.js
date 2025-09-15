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
        let uniqueKeyPrefix;
        axios.get(parsedResumeURL, { responseType: 'arraybuffer' })
        .then(response => {
            uniqueKeyPrefix = Date.now() + '-';
            parsedResumeFileName = "parsedOutputResume.pdf";
            const filePath = path.join(__dirname, '../uploads/Cloud', parsedResumeFileName);
            fs.writeFileSync(filePath, response.data); // Save PDF to disk <- MIGHT HAVE TO BE ASYNC
        }).catch(error => {
            console.error("Error fetching parsed resume PDF:", error);
            return res.status(500).json({ success: false, message: 'Error fetching parsed resume PDF' });
        });

        //create buckets

        //original resume
        // try {
        //     await createBucket('resumate-documents-storage-cloud-original-resume');
        // } catch (err) {
            
        //     console.error("Error creating original resume bucket :", err);
        //     return res.status(500).json({ success: false, message: 'Error creating S3 bucket' });
        // }
        //output parsed resume

        // try {
        //     await createBucket('resumate-documents-storage-cloud-output-parsed-resume');
        // } catch (err) {
        //     console.error("Error creating parsed resume bucket :", err);
        //     return res.status(500).json({ success: false, message: 'Error creating S3 bucket' });
        // }

       //upload files to s3
        //path to the original resume: req.file.path (../uploads/Cloud/originalResume.pdf)
        //path to the parsed resume: (../uploads/Cloud/{parsedResumeFileName})
        const pathToOriginalResume = path.join(__dirname, '../uploads/Cloud', 'originalResume.pdf');
        const pathToParsedResume = path.join(__dirname, '../uploads/Cloud', parsedResumeFileName);
        try {
            const sendingOriginalFile = await s3Client.send(new PutObjectCommand({
                Bucket: 'resumate-documents-storage-cloud-original-resume',
                Key: uniqueKeyPrefix + 'originalResume.pdf',
                Body: await readFile(pathToOriginalResume)
            }));
            //unlink the file after upload <- DO THIS
        } catch (err) {
            console.error("Error uploading original resume to S3:", err);
            return res.status(500).json({ success: false, message: 'Error uploading original resume to S3' });
        }
        try {
            const sendingParsedFile = await s3Client.send(new PutObjectCommand({
                Bucket: 'resumate-documents-storage-cloud-output-parsed-resume',
                Key: uniqueKeyPrefix + "parsedOutputResume.pdf",
                Body: await readFile(pathToParsedResume)
            }));
            //unlink the file after upload <- DO THIS
        } catch (err) {
            console.error("Error uploading parsed resume to S3:", err);
            return res.status(500).json({ success: false, message: 'Error uploading parsed resume to S3' });
        }
        
        //URL of the object: https://<bucket-name>.s3.<region>.amazonaws.com/<object-key> <- Not doing this approach cause then we have to make it public
        
        
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