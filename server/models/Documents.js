const mongoose = require('mongoose');
const { default: JobDescription } = require('../../client/src/Components/JobDescription/JobDescription');

/*
    The general process
1. Choose a cloud storage provider. Select a service like AWS S3 or Google Cloud Storage. Create an account, set up a storage bucket, and configure appropriate security and access permissions.
2. Upload the file. Your application server receives the file from a user. Instead of storing the file locally, the server uses the cloud provider's SDK to upload the file to your designated storage bucket. It's best practice to generate a unique filename (e.g., using a UUID) to prevent naming conflicts.
3. Get the file's URL. After a successful upload, the cloud storage service will provide a unique URL for the file. This URL acts as the reference to the file's location.
4. Save the reference in MongoDB. Your application server then saves the file's metadata, including its name, type, and the unique URL, into a MongoDB document. This links the file to the relevant document in your database.
5. Retrieve and serve the file. When a client requests the file, your application queries the MongoDB database for the document containing the file's URL. It then sends this URL back to the client, allowing their web browser to load the file directly from your high-performance cloud storage.
*/

// Schema for storing the actual resume file, job description, and the parsed resume
const pastQuerySchema = new mongoose.Schema({
    resume: Buffer,
    JobDescription: String,
    parsedResume: Buffer
});

const DocumentStoring = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    pastQueries: [pastQuerySchema]
});

const DocumentModel = mongoose.model('DocumentStore', DocumentStoring);

export default DocumentModel;
