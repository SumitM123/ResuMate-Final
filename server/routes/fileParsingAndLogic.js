const express = require('express');
const router = express.Router();
const fs = require("fs").promises;
const path = require('path');
//const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
//const canvas = require('canvas');
require("dotenv").config({ path: path.join(__dirname, '../config.env') });

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatGroq } = require("@langchain/groq");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { RunnableSequence } = require("@langchain/core/runnables");
const { ChatOpenAI } = require("@langchain/openai");
const multer = require('multer');

// Debug log to check if API key is loaded
console.log('Environment loaded:', {
    geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    configPath: path.join(__dirname, '../config.env')
});

const googleGemini = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-pro",
    apiKey: process.env.GEMINI_API_KEY
});

const googleGeminiVision = new ChatGoogleGenerativeAI({
    model: "gemini-pro-vision",
    apiKey: process.env.GEMINI_API_KEY
});

const gorq = new ChatGroq({
    model: "llama3-8b-8192",
    apiKey: process.env.GROQ_API_KEY
});

const openAI = new ChatOpenAI({
    model: "gpt-4.1-mini",
    apiKey: process.env.OPENAI_KEY
});
const uploadDir = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
const upload = multer({
    storage: storage
});

//might have to combine the JSON extraction and job description extraction into 1

router.post(
  '/extractJSONAndKeywords',
  upload.single('resume'),
  async (req, res) => {
    console.log("Checking if resume has been uploaded successfully");
    try {

      // 1. Read uploaded file
      const filePath = path.join(uploadDir, req.file.filename);
      const pdfBytes = await fs.readFile(filePath);

      // 2. Encode to base64
      const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

      // 3. Build messages for chat model
      const messages = [
        new SystemMessage(
          "You are a helpful Resume Parser AI assistant. Extract all information from the resume and return it in a structured JSON format."
        ),
        new HumanMessage({
          content: [
            {
              type: "text",
              text: "Please parse this resume and provide the data in the following JSON structure: { personalInfo: {}, experience: [], education: [], skills: [], projects: [], certifications: [] }"
            },
            {
              type: "file",
              source_type: "base64",
              mime_type: "application/pdf",
              data: pdfBase64
            }
          ]
        })
      ];

      // 4. Await response from chat model
      const response = await googleGemini.invoke(messages);

      // 5. Send back model response
      res.status(200).json({
        success: true,
        parsedResume: response
      });

    } catch (err) {
      console.error("Error parsing uploading resume:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// router.post('/', upload.fields([
//     {name: 'resume', maxCount: 1}
// ]), async (req, res) => {
//   try {
//     if (!req.body.payLoad || typeof req.body.payLoad !== 'string') {
//       throw new Error('Invalid payload format');
//     }

//     // Get base64 (strip data URI if present)
//     const base64Data = req.body.payLoad.split(',')[1] || req.body.payLoad;

//     const messages = [
//       new SystemMessage(
//         "You are a helpful Resume Parser AI assistant. Extract all information from the resume and return it in a structured JSON format."
//       ),
//       new HumanMessage({
//         content: [
//           {
//             type: "text",
//             text: "Please parse this resume and provide the data in the following JSON structure: { personalInfo: {}, experience: [], education: [], skills: [], projects: [], certifications: [] }"
//           },
//           {
//             type: "input_file",
//             file_data: {
//               mime_type: "application/pdf",
//               data: base64Data
//             }
//           }
//         ],
//       }),
//     ];

//     const response = await googleGeminiVision.invoke(messages);

//     res.status(200).json({
//       success: true,
//       message: 'Document parsed successfully',
//       data: response,
//     });

//   } catch (error) {
//     console.error('Error details:', {
//       message: error.message,
//       stack: error.stack,
//       payload: req.body.payLoad ? req.body.payLoad.substring(0, 100) + '...' : 'No payload'
//     });
//     res.status(500).json({
//       success: false,
//       error: 'Error processing request: ' + error.message,
//       details: error.stack
//     });
//   }
// });


//this is to extract the keywords from the job description
router.post('/JobDescriptionKeyWord', async (req, res) => { 
    //send formData to this shi where the body will have the job description
    try {
        const messages = [
            new SystemMessage("You are an expert job description analyzer. Extract the most relevant keywords that a candidate should have on their resume to match this job posting."),
            new HumanMessage({
                content: `Analyze this job description and extract the most important keywords in the following categories: ${req.body.jobDescription}

            1. Technical Skills (programming languages, frameworks, tools, software)
            2. Soft Skills (communication, leadership, problem-solving, etc.)
            3. Experience Level (years, seniority keywords)
            4. Industry Terms (domain-specific terminology)
            5. Education/Certifications (degrees, certificates, qualifications)
            6. Job Functions (responsibilities, actions, duties)

            Job Description:
            ${req.body.jobDescription}

            Focus on extracting specific, actionable keywords that would be found on a resume. Avoid generic terms.`
                        })
        ];

        const response = await gorq.invoke(messages);
        console.log('Job description keywords extracted:', response);
        
        res.status(200).json({
            success: true,
            message: 'Keywords extracted successfully',
            data: response.content
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error processing request: ' + error.message 
        });
    }
});

// LIL PREREQUISITE, WE CAN PROBABLY ENSURE THAT THE RESUME HAS A PROPER STRUCTURE. SUCH AS EXPERIENCE, EDUCATION, ETC
/*
    Now you have to create a chain of runnables to link together responses of one another
        you have a chain of two runnables
            1) cross check the resume with the keywords, and check if used properly. If not, fix it. For each one, the HumanMessage is the JSON strucuture of the resume.
            2) create a prompt for the LLM to fill in the missing keywords, and use it properly
            3) whenever possible, another llm to use the XYZ format.
            4) input the edited JSON structure into the JAKE'S RESUME, and then return the new resume to the user.
            5) Cross check the JSON structure and ensure that Jake's resume follows the JSON structure
*/

router.post('/editResume', async (req, res) => {
    const { resumeData, jobDescriptionKeywords } = req.body;

    const message1 = [
        new SystemMessage(`
            You are an expert resume editor with deep knowledge of Applicant Tracking Systems (ATS) and keyword optimization. 
            You will be provided:
            1. A resume in JSON format.
            2. A list of keywords extracted from a job description.
            

            Your task is to:
            - Analyze the resume against the provided keywords and job description.
            - Identify missing or underrepresented keywords that are relevant to the role.
            - Incorporate these keywords into the JSON resume in a natural, contextually accurate, and semantically meaningful way.
            - Ensure all edits preserve the resume’s logical flow, clarity, and accuracy without fabricating experience.
            - Maintain the original JSON structure and formatting, adding or modifying only where it logically fits (e.g., skills, work experience, achievements).
            - Optimize the resume content to be more ATS-friendly by improving keyword density and relevance without keyword stuffing.
            - Ensure the final resume is professional, factual, and consistent with the candidate's background.
            - Ensure that the previous content is semantically correct and does not contradict the new content.
            
            Your final output must:
            - Return the complete, updated JSON resume.
            - Include all original content except where improved to better match the job description.
            - Follow a professional tone and ensure factual consistency with the candidate's background.
            - It HAS to be in a JSON format, and the content must be in a string format.
            `),
        new HumanMessage({
            content: `Resume Data: ${JSON.stringify(resumeData)}. Here is the job description keywords: ${JSON.stringify(jobDescriptionKeywords)}.`
    })];

    const message2 = [
        new SystemMessage(`
            You are an expert resume editor with deep knowledge of Applicant Tracking Systems (ATS), keyword optimization, and the XYZ resume format.

            **Your Objective:**
            Take the provided JSON resume and improve bullet points and experience descriptions by applying the XYZ format whenever possible, to clearly quantify the candidate's impact.

            **The XYZ Format:**
            "Accomplished [X] by [Y], resulting in [Z]."
            Example:
            Weak: "Managed store inventory."
            Strong: "Reduced inventory discrepancies by 20% by implementing a digital tracking system, resulting in more efficient restocking."

            **Instructions:**
            1. Apply the XYZ format to relevant bullet points and descriptions, adding measurable outcomes (percentages, amounts, time saved, scope, etc.) where plausible and consistent with the candidate's background.
            2. Preserve factual accuracy—do not invent achievements, but you may reasonably estimate metrics if none are provided, ensuring they remain realistic.
            3. Maintain all original resume sections and structure; only enhance the text within them.
            4. Ensure content remains professional, concise, and aligned with the job description (if provided), naturally incorporating relevant keywords.
            5. Return the updated resume **in valid JSON format**, keeping all values as strings.

            **Output Requirements:**
            - The **entire updated JSON resume**.
            - No additional commentary—only the JSON result.
        `),
        new HumanMessage({
            content: `Resume Data: ${JSON.stringify(resumeData)}`
        })
    ];

    const prompt1 = ChatPromptTemplate.fromMessages(message1);
    const prompt2 = ChatPromptTemplate.fromMessages(message2);
    
    //This is of type string
    const chain = new RunnableSequence({
        first: new LLMChain({ llm: googleGemini, prompt: prompt1 }),
        second: new LLMChain({ llm: gorq, prompt: prompt2 }),
        verbose: true
    });

    /*
        I provide it the Jake's resume format, and I'll tell the LLM to implement the edited JSON structure into the 
        resume format. Then save that as a .tex file. Then use an external API to convert that .tex file into a 
        pdf and output it to the user. 


    */ 
    //can't just upload a file. Have to encode the file and pass into system message
    const latexTemplate = fs.readFileSync("'../lib/JakeResume.tex'", "utf8");

    const message3 = [
        new SystemMessage({
          content: `
                You are an expert LaTeX formatter specializing in professional resumes.
                
                You will always follow these rules:
                1. Use the provided LaTeX template exactly as given — do not alter formatting, commands, spacing, or section order.
                2. Replace each placeholder (e.g., {{name}}, {{contact}}, {{experience}}, etc.) in the template with the corresponding value from the user's JSON.
                3. If a placeholder's value is missing in the JSON, leave it empty but keep the placeholder's LaTeX structure intact.
                4. Escape special LaTeX characters in user-provided text: %, $, _, &, #, {, }.
                5. Return **only** the completed LaTeX code — no comments, no explanations, no extra formatting outside of LaTeX.
                
                TEMPLATE START:
                ${latexTemplate}
                TEMPLATE END
                    `
        }),
        new HumanMessage({
            content: `
                This is the JSON-structured resume to populate into the LaTeX template: ${chain}
            `
        })
    ];
    openAI.invoke(message3).then((latexResponse) => {
        res.status(200).json({
            success: true,
            message: 'Resume formatted successfully',
            data: latexResponse.content
        });
    }).catch((error) => {
        console.error('Error formatting LaTeX resume:', error);
    });
    try {
        //you need to send the response back to the front end
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error processing request: ' + error.message 
        });
    }
});
router.post('/convertToPDF', async (req, res) => {
    const { latexContent } = req.body;

    try {
        // Assuming you have a function to convert LaTeX to PDF
        
    } catch (error) {
        console.error('Error converting LaTeX to PDF:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error converting LaTeX to PDF: ' + error.message 
        });
    }
});
module.exports = router;
