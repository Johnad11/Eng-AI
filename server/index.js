import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

export default app;


// Configure Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Helper to extract text from PDF
async function extractTextFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
}

// Helper to convert file to GoogleGenerativeAI.Part object
function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

app.post('/api/chat', upload.single('file'), async (req, res) => {
    try {
        const { message, model: selectedModel } = req.body;
        const file = req.file;

        // Default to flash if not specified or invalid
        const modelName = selectedModel === 'pro' ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
        const model = genAI.getGenerativeModel({ model: modelName });

        const systemPrompt = `You are an expert Engineering Problem Solver AI. 
        Your goal is to provide accurate, step-by-step solutions to complex engineering problems.
        Use LaTeX for all mathematical formulas (wrap them in $ for inline or $$ for blocks).
        Be precise and professional. 
        If a file (PDF text or image) is provided, use it to answer the question.`;

        let promptParts = [systemPrompt];

        if (file) {
            if (file.mimetype === 'application/pdf') {
                const pdfText = await extractTextFromPDF(file.path);
                promptParts.push(`Context from PDF: ${pdfText}`);
            } else if (file.mimetype.startsWith('image/')) {
                promptParts.push(fileToGenerativePart(file.path, file.mimetype));
            }
        }

        promptParts.push(`User Question: ${message}`);

        const result = await model.generateContent(promptParts);
        const response = await result.response;
        const text = response.text();

        // Cleanup file
        if (file) fs.unlinkSync(file.path);

        res.json({ text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Production: Serve static files from the client/dist folder
const __dirname = path.resolve();
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/dist')));

    app.use((req, res, next) => {
        if (req.method === 'GET' && req.accepts('html')) {
            res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
        } else {
            next();
        }
    });
}

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

