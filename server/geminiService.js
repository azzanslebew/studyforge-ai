import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPTS } from './prompts.js';
import {
  generateFallbackLesson,
  generateFallbackFlashcards,
  generateFallbackQuiz,
  generateFallbackExam,
  generateFallbackTutorResponse
} from './mockEducationalData.js';

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.genAI = null;

    if (this.apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
      } catch (err) {
        console.error('Failed to initialize GoogleGenerativeAI client:', err.message);
      }
    }
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.length > 5 && this.genAI);
  }

  getModelInfo() {
    return {
      hasKey: this.isConfigured(),
      model: this.modelName,
      status: this.isConfigured() ? 'live' : 'demo_mode'
    };
  }

  cleanJsonString(raw) {
    if (!raw) return '';
    let cleaned = raw.trim();
    // Strip markdown code fences if present
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/```$/, '').trim();
    }
    return cleaned;
  }

  async generateLesson({ topic, text, sourceTitle, educationLevel, explanationStyle }) {
    if (!this.isConfigured()) {
      return {
        isDemoFallback: true,
        demoNotice: 'Mode Demo Aktif: Kunci API Gemini belum dikonfigurasi. Menggunakan kurikulum simulasi cerdas.',
        data: generateFallbackLesson(topic, text, sourceTitle, educationLevel, explanationStyle)
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
        systemInstruction: SYSTEM_PROMPTS.LESSON_GENERATOR,
      });

      const prompt = `Buatlah Rangkuman Materi Pembelajaran (AI Study Notes) lengkap dalam Bahasa Indonesia:
Topik: ${topic || 'Sesuai dengan teks berikut'}
Judul Sumber: ${sourceTitle || 'Materi Belajar'}
Tingkat Pendidikan: ${educationLevel || 'Universitas'}
Gaya Penjelasan: ${explanationStyle || 'Lengkap & Akademis'}

Materi Sumber / Catatan:
${text ? text.slice(0, 15000) : 'Eksplorasi mendalam mengenai topik ini dengan studi kasus nyata dan penjelasan akademis.'}
`;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      const cleaned = this.cleanJsonString(textResponse);
      const parsed = JSON.parse(cleaned);

      return {
        isDemoFallback: false,
        data: parsed
      };
    } catch (err) {
      console.warn('Gemini API lesson generation failed or quota reached, using fallback:', err.message);
      return {
        isDemoFallback: true,
        demoNotice: `Gemini API kendala (${err.message}). Beralih otomatis ke kurikulum cerdas cadangan.`,
        data: generateFallbackLesson(topic, text, sourceTitle, educationLevel, explanationStyle)
      };
    }
  }

  async tutorChat({ message, history = [], contextLesson, explanationStyle }) {
    if (!this.isConfigured()) {
      return {
        isDemoFallback: true,
        demoNotice: 'Mode Demo Aktif: Respon tutor dihasilkan oleh agen edukasi lokal cerdas.',
        reply: generateFallbackTutorResponse(message, contextLesson, history)
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.6,
        },
        systemInstruction: SYSTEM_PROMPTS.AI_TUTOR,
      });

      // Prepare context summary if lesson is present
      let contextHeader = '';
      if (contextLesson) {
        contextHeader = `[Konteks Materi Saat Ini: "${contextLesson.title || 'Materi'}"]
Overview: ${contextLesson.overview || 'Tidak ada'}
Poin Kunci: ${Array.isArray(contextLesson.keyConcepts) ? contextLesson.keyConcepts.map(k => k.name).join(', ') : ''}
Gaya Belajar: ${explanationStyle || 'Lengkap & Mudah Dipahami'}
---
`;
      }

      // Convert history for Gemini
      const formattedHistory = history.map(item => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.content }]
      }));

      const chat = model.startChat({
        history: formattedHistory.slice(-8), // Keep manageable context size
      });

      const prompt = contextHeader ? `${contextHeader}\nPertanyaan Mahasiswa: ${message}` : message;
      const result = await chat.sendMessage(prompt);
      const reply = result.response.text();

      return {
        isDemoFallback: false,
        reply
      };
    } catch (err) {
      console.warn('Gemini tutor chat error, fallback used:', err.message);
      return {
        isDemoFallback: true,
        demoNotice: `Gemini API kendala (${err.message}). Beralih ke respon edukasi cadangan.`,
        reply: generateFallbackTutorResponse(message, contextLesson, history)
      };
    }
  }

  async generateFlashcards({ lessonTitle, content, count = 6, subject = 'Umum' }) {
    if (!this.isConfigured()) {
      return {
        isDemoFallback: true,
        demoNotice: 'Mode Demo Aktif: Flashcards dibuat dari dataset kurikulum teruji.',
        flashcards: generateFallbackFlashcards(lessonTitle, count, subject)
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
        systemInstruction: SYSTEM_PROMPTS.FLASHCARD_GENERATOR,
      });

      const prompt = `Ekstrak tepat ${count} kartu flashcard cerdas (Smart Flashcards) dari materi berikut dalam Bahasa Indonesia:
Judul: ${lessonTitle}
Subjek: ${subject}
Konten Materi:
${content.slice(0, 10000)}
`;

      const result = await model.generateContent(prompt);
      const cleaned = this.cleanJsonString(result.response.text());
      const parsed = JSON.parse(cleaned);

      return {
        isDemoFallback: false,
        flashcards: parsed.flashcards || []
      };
    } catch (err) {
      console.warn('Gemini flashcard generation failed, fallback used:', err.message);
      return {
        isDemoFallback: true,
        demoNotice: 'Gemini API kendala. Flashcards dibuat menggunakan generator lokal.',
        flashcards: generateFallbackFlashcards(lessonTitle, count, subject)
      };
    }
  }

  async generateQuiz({ lessonTitle, content, count = 5, difficulty = 'mixed' }) {
    if (!this.isConfigured()) {
      return {
        isDemoFallback: true,
        demoNotice: 'Mode Demo Aktif: Kuis dibuat dari bank soal simulasi akademik.',
        quiz: generateFallbackQuiz(lessonTitle, count)
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
        systemInstruction: SYSTEM_PROMPTS.QUIZ_GENERATOR,
      });

      const prompt = `Buatkan kuis evaluasi pemahaman sebanyak ${count} pertanyaan (campuran multiple_choice dan true_false) berdasarkan materi berikut dalam Bahasa Indonesia:
Tingkat Kesulitan: ${difficulty}
Judul Materi: ${lessonTitle}
Konten:
${content.slice(0, 10000)}
`;

      const result = await model.generateContent(prompt);
      const cleaned = this.cleanJsonString(result.response.text());
      const parsed = JSON.parse(cleaned);

      return {
        isDemoFallback: false,
        quiz: parsed
      };
    } catch (err) {
      console.warn('Gemini quiz generation failed, fallback used:', err.message);
      return {
        isDemoFallback: true,
        demoNotice: 'Gemini API kendala. Kuis dibuat menggunakan generator lokal.',
        quiz: generateFallbackQuiz(lessonTitle, count)
      };
    }
  }

  async generateExam({ subject, lessonTitles, contentSummary, count = 10, difficulty = 'hard', timeMinutes = 30 }) {
    if (!this.isConfigured()) {
      return {
        isDemoFallback: true,
        demoNotice: 'Mode Demo Aktif: Try Out disusun dari bank soal kurikulum nasional.',
        exam: generateFallbackExam(subject, lessonTitles, count, timeMinutes)
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
        systemInstruction: SYSTEM_PROMPTS.EXAM_GENERATOR,
      });

      const prompt = `Buatlah Try Out / Simulasi Ujian Mandiri sebanyak ${count} soal pilihan ganda berbobot analisis (HOTS) dalam Bahasa Indonesia:
Mata Kuliah / Subjek: ${subject}
Materi Acuan: ${lessonTitles.join(', ')}
Waktu Tersedia: ${timeMinutes} menit
Ringkasan Materi:
${contentSummary ? contentSummary.slice(0, 10000) : 'Uji konsep-konsep kunci dan pemecahan kasus praktis.'}
`;

      const result = await model.generateContent(prompt);
      const cleaned = this.cleanJsonString(result.response.text());
      const parsed = JSON.parse(cleaned);

      return {
        isDemoFallback: false,
        exam: parsed
      };
    } catch (err) {
      console.warn('Gemini exam generation failed, fallback used:', err.message);
      return {
        isDemoFallback: true,
        demoNotice: 'Gemini API kendala. Ujian dibuat menggunakan generator lokal.',
        exam: generateFallbackExam(subject, lessonTitles, count, timeMinutes)
      };
    }
  }
}

export const geminiService = new GeminiService();
