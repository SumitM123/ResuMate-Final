import express from "express";
import fs from "fs/promises";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { RunnableSequence } from "@langchain/core/runnables";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import FormData from "form-data";
import axios from "axios";
import { spawn } from "child_process";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Debug log to check if API key is loaded
console.log("Environment loaded:", {
  geminiKeyLength: process.env.GEMINI_API_KEY
    ? process.env.GEMINI_API_KEY.length
    : 0,
  configPath: path.join(__dirname, "../config.env"),
});

const googleGemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-pro",
  apiKey: process.env.GEMINI_API_KEY,
});

const googleGeminiVision = new ChatGoogleGenerativeAI({
  model: "gemini-pro-vision",
  apiKey: process.env.GEMINI_API_KEY,
});

const groq = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
});

const openAI = new ChatOpenAI({
  model: "gpt-4",
  apiKey: process.env.OPENAI_KEY,
});

const uploadDir = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

//might have to combine the JSON extraction and job description extraction into 1

//WORKS
router.post(
  '/extractJSON',
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
        parsedResume: response.content
      });
      console.log("JSON has been extracted.");
      console.log("The response content object from AI model: " + JSON.stringify(response.content));
    } catch (err) {
      console.error("Error parsing uploading resume:", err);
      res.status(500).json({ success: false, error: err.message });
    }
    //Any code after the callback function will execute immediately. 
    await fs.unlink(path.join(uploadDir, req.file.filename)).catch((err) => {
      if(err.code === "ENOENT") {
        console.warn("File not found, nothing to delete:", err.path);
      } else {
        console.error("Error deleting uploaded file:", err);
      }
    });
});

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
    console.log("Here is the job description from the req object: " + req.body.jobDescription);
    console.log("The job description that's not in the body: " + req.jobDescription);
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

            Focus on extracting specific, actionable keywords that would be found on a resume. Avoid generic terms. ENSURE THAT THE OUTPUT IS IN JSON FORMAT. `
            })
        ];

        const response = await groq.invoke(messages);
        console.log('Job description keywords extracted:', response.content);
        
        res.status(200).json({
            success: true,
            message: 'Keywords extracted successfully',
            keyWordExtraction: response.content
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

    console.log("Before the prompt chains");
    const prompt1 = ChatPromptTemplate.fromMessages(message1);
    const prompt2 = ChatPromptTemplate.fromMessages(message2);
    
    const chain1 = prompt1.pipe(googleGemini);
    const chain2 = prompt2.pipe(groq);

    const fullChain = RunnableSequence.from([
      chain1,
      (outputFromFirst) => ({ text: outputFromFirst.content }), 
      chain2,
    ]);
    let chainResult = "";
    try {
      console.log("Before invoking the full chain");
      chainResult = await fullChain.invoke({ resumeData, jobDescriptionKeywords });
      console.log("After invoking the full chain");
      res.status(200).json({
        success: true,
        message: 'Resume edited successfully',
        data: chainResult.content
      });
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ 
          success: false,
          error: 'Error processing request: ' + error.message
      });
      return;
    }
});

router.put('/changeToLaTeX', async (req, res) => {
  const { chainResult } = req.body;
  const latexTemplate = await fs.readFile(path.join(__dirname, "../lib/template.tex"), "utf8");
  const message = [
    new SystemMessage({
      content: `
            You are an expert LaTeX formatter specializing in professional resumes. Your job is to incorporate the JSON-structured resume data into the provided LaTeX template.

              You will always follow these rules:
              1. Use the provided LaTeX template exactly as given — do not alter formatting, commands, spacing, or section order.
              2. Replace each placeholder or tag in the template with the corresponding value from the user's JSON. If the corresponding section is missing from the 
                  JSON, delete that section when providing the output LaTeX code. 
                  For example: Since there is a relevant coursework section in the template structure, but if the JSON resume does not have the Coursework section, or anything related to that matter, delete it. 
                  So the following LaTeX code below would be removed entirely. And keep this rule for all the sections that are present inside the template. 
                  \section{Relevant Coursework}
                  \begin{multicols}{4}
                      \begin{itemize}[itemsep=-5pt, parsep=3pt]
                          \item Course 1
                          \item Course 2
                          \item Course 3
                          \item Course 4
                          \item Course 5
                          \item Course 6
                          \item Course 7
                          \item Course 8
                      \end{itemize}
                  \end{multicols}
              3. Escape special LaTeX characters in user-provided text: %, $, _, &, #, {, }.
              4. Return **only** the completed LaTeX code — no explanations, no extra formatting outside of LaTeX.
              5. ENSURE THE FINAL LaTeX COMPILES WITHOUT ERRORS. THIS IS ESSENTIAL.

               **IMPORTANT:** Do NOT include any code block markers such as triple backticks, 'latex', or any markdown formatting. For example, do NOT return:
                [code block] 
                \\documentclass{...}
                ...
                [end code block]

                DON'T HAVE LATEX CODE BLOCK MARKERS. JUST PURE CODE. 
                Instead, return only the raw LaTeX code.
                TEMPLATE START:
                  ${latexTemplate}
                TEMPLATE END
              

                Also, ENSURE THAT THE LATEX CODE IS COMPLETE AND CAN BE COMPILED WITHOUT ERRORS. THIS IS CRUCIAL.
            `
    }),
    new HumanMessage({
        content: `
            This is the JSON-structured resume to populate into the LaTeX template: ${chainResult}
        `
    })
  ];
  let latexResponse = "";
  const cleanLatex = (latex) => {
    // Remove code block markers
    latex = latex.replace(/```latex|```/g, '');

    // Remove empty list environments (itemize, enumerate, description)
    latex = latex.replace(/\\begin\{(itemize|enumerate|description)\}[\s\n]*?\\end\{\1\}/g, '');

    // Remove empty \section{} or \subsection{} headers
    latex = latex.replace(/\\section\{[ \t]*\}\s*/g, '');
    latex = latex.replace(/\\subsection\{[ \t]*\}\s*/g, '');

    // Remove any stray empty \item lines
    latex = latex.replace(/\\item\s*(?=(\\item|\\end\{))/g, '');

    // Remove \item with only whitespace or no content
    latex = latex.replace(/\\item\s*[\n\r]+/g, '');

    // Collapse too many blank lines
    latex = latex.replace(/\n{3,}/g, '\n\n');

    // Remove lines with only LaTeX commands and no content (e.g., \item, \section{})
    latex = latex.replace(/^(\\[a-zA-Z]+)\s*$/gm, '');

    // Remove unmatched closing braces at the end of the file
    latex = latex.replace(/^\s*}\s*$/gm, '');

    // Optionally, check for balanced braces (rudimentary)
    const openBraces = (latex.match(/{/g) || []).length;
    const closeBraces = (latex.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      console.warn('Warning: Unmatched braces in LaTeX code.');
      // Optionally, try to fix by adding missing braces (not recommended for production)
      // latex += '}'.repeat(openBraces - closeBraces);
    }

    return latex.trim();
  }
  try {
    latexResponse = await openAI.invoke(message);
    latexResponse.content = cleanLatex(latexResponse.content);
    console.log("LaTeX resume formatted backend:", latexResponse.content);
    res.status(200).json({
        success: true,
        message: 'Resume formatted successfully',
        latexResponse: latexResponse.content
    });
  } catch (error) {
    console.error('Error formatting LaTeX resume:', error);
      res.status(500).json({ 
          success: false,
          error: 'Error processing request: ' + error.message 
      });
  }
});

router.post("/convertToPDF", async (req, res) => {
  const { latexContent } = req.body;
  const outputDir = path.join(__dirname, "../lib/local");
  try {
    await fs.mkdir(outputDir, { recursive: true }); // Ensure output directory exists
    const tempFile = path.join(outputDir, "temp.tex");

    await fs.writeFile(tempFile, latexContent);

    const pdfBuffer = await new Promise((resolve, reject) => {
      const proc = spawn("tectonic", [tempFile, `--outdir=${outputDir}`, "--keep-logs"], {
        stdio: "inherit",
      });

      proc.on("close", async (code) => {
        if (code === 0) {
          try {
            const buffer = await fs.readFile(path.join(outputDir, "temp.pdf"));
            resolve(buffer);
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error(`LaTeX compile failed with code ${code}`));
        }
      });
    });
    
    /* Sending the PDF buffer to chatmodel if it throws an error, and adds the message to the chatmodel with the template such that 
       it'll fix the LaTeX code based on the error thrown. */
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=output.pdf");
    res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error("Error converting LaTeX:", error);
    res.status(500).json({ error: "Failed to convert LaTeX to PDF" });
  }

  await fs.unlink(path.join(outputDir, "temp.tex")).catch((err) => {
    if(err.code === "ENOENT") {
      console.warn("temp.tex file not found, nothing to delete:", err.path);
    } else {
      console.error("Error deleting temp.tex file:", err);
    }
  });
  await fs.unlink(path.join(outputDir, "temp.pdf")).catch((err) => {
    if(err.code === "ENOENT") {
      console.warn("temp.pdf file not found, nothing to delete:", err.path);
    } else {
      console.error("Error deleting temp.pdf file:", err);
    }
  });
  await fs.unlink(path.join(outputDir, "temp.log")).catch((err) => {
    if(err.code === "ENOENT") {
      console.warn("temp.log file not found, nothing to delete:", err.path);
    } else {
      console.error("Error deleting temp.log file:", err);
    }
  });
});

export default router;

