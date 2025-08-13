const express = require('express');
const router = express.Router();
const fs = require("fs");
require("dotenv").config({ path: "./config.env" });
// import { GoogleGenAI } from "@google/genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {ChatGroq} from "@langchain/groq"
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { RunnableSequence } from "@langchain/core/runnables";
import { partialDeepStrictEqual } from "assert";
import { ChatOpenAI } from "@langchain/openai"; // ✅ import for OpenAI

const googleGemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY});

const gorq = new ChatGroq({
    model: "llama3-8b-8192",
    apiKey: process.env.GROQ_API_KEY
});

const openAI = new ChatOpenAI({
    model: "gpt-4.1-mini",
    apiKey: process.env.OPENAI_KEY
  });

// What is file in this case. 
router.post('/', async (req, res) => { 
    try {
        const messages = [
        new SystemMessage("You are a helpul Resume Parser AI assistant."),
        new HumanMessage({
            content: [
            { type: 'text', text: 'Please parse the resume and provide me with the JSON data of the resume.' },
            { type: 'image_url', image_url: req.body.payLoad }, // Include the base64 data URL here
            ],
        }),
        ];
        const response = await googleGemini.invoke(messages);
        console.log('Response from Google GenAI:', response);
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

//this is to extract the keywords from the job description
router.post('/JobDescriptionKeyWord', async (req, res) => { 
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
    const chain = new SimpleSequentialChain({
        chains: [new LLMChain({llm : googleGemini, prompt: promp1}), new LLMCChain({llm: gorq, prompt2})],
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
module.exports = router;
