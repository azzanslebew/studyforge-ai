import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { geminiService } from './geminiService.js';
import {
  generateLessonSchema,
  tutorChatSchema,
  generateFlashcardsSchema,
  generateQuizSchema,
  generateExamSchema
} from './validation.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Multer in-memory storage for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting for AI generation
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // max 120 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Terlalu banyak permintaan AI. Silakan tunggu beberapa saat lagi.'
  }
});

// Health check and Gemini configuration status
app.get('/api/health', (req, res) => {
  const modelInfo = geminiService.getModelInfo();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfig: modelInfo,
  });
});

// PDF Parsing Endpoint
app.post('/api/materials/parse-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Tidak ada file PDF yang diunggah.' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, error: 'Format file tidak didukung. Harap unggah dokumen PDF.' });
    }

    const dataBuffer = req.file.buffer;
    const parsed = await pdfParse(dataBuffer);

    const extractedText = (parsed.text || '').trim();

    if (!extractedText || extractedText.length < 20) {
      return res.status(422).json({
        success: false,
        error: 'Teks tidak dapat diekstrak dari PDF. Dokumen mungkin berupa scan gambar murni tanpa lapisan teks OCR.',
        pageCount: parsed.numpages || 1,
      });
    }

    res.json({
      success: true,
      text: extractedText,
      pageCount: parsed.numpages,
      characterCount: extractedText.length,
      info: parsed.info || {},
    });
  } catch (err) {
    console.error('PDF parsing error:', err.message);
    res.status(500).json({
      success: false,
      error: `Gagal membaca file PDF: ${err.message}`
    });
  }
});

// Lesson Notes Generator
app.post('/api/ai/generate-lesson', aiLimiter, async (req, res) => {
  try {
    const validated = generateLessonSchema.parse(req.body);
    const result = await geminiService.generateLesson(validated);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Lesson generation error:', err);
    res.status(400).json({
      success: false,
      error: err.errors ? err.errors[0].message : err.message
    });
  }
});

// Interactive AI Tutor Chat
app.post('/api/ai/tutor-chat', aiLimiter, async (req, res) => {
  try {
    const validated = tutorChatSchema.parse(req.body);
    const result = await geminiService.tutorChat(validated);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Tutor chat error:', err);
    res.status(400).json({
      success: false,
      error: err.errors ? err.errors[0].message : err.message
    });
  }
});

// Flashcards Generator
app.post('/api/ai/generate-flashcards', aiLimiter, async (req, res) => {
  try {
    const validated = generateFlashcardsSchema.parse(req.body);
    const result = await geminiService.generateFlashcards(validated);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Flashcard generation error:', err);
    res.status(400).json({
      success: false,
      error: err.errors ? err.errors[0].message : err.message
    });
  }
});

// Quiz Generator
app.post('/api/ai/generate-quiz', aiLimiter, async (req, res) => {
  try {
    const validated = generateQuizSchema.parse(req.body);
    const result = await geminiService.generateQuiz(validated);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Quiz generation error:', err);
    res.status(400).json({
      success: false,
      error: err.errors ? err.errors[0].message : err.message
    });
  }
});

// Exam Practice Generator
app.post('/api/ai/generate-exam', aiLimiter, async (req, res) => {
  try {
    const validated = generateExamSchema.parse(req.body);
    const result = await geminiService.generateExam(validated);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Exam generation error:', err);
    res.status(400).json({
      success: false,
      error: err.errors ? err.errors[0].message : err.message
    });
  }
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Terjadi kesalahan internal pada server StudyForge AI.'
  });
});

app.listen(PORT, () => {
  console.log(`StudyForge AI backend server running on http://localhost:${PORT}`);
  console.log(`Gemini status: ${geminiService.isConfigured() ? 'Connected (Live AI)' : 'Demo Mode (No API key found)'}`);
});
