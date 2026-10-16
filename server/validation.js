import { z } from 'zod';

export const generateLessonSchema = z.object({
  topic: z.string().optional(),
  text: z.string().optional(),
  sourceTitle: z.string().optional(),
  educationLevel: z.string().default('Universitas'),
  explanationStyle: z.string().default('Lengkap & Akademis'),
}).refine(data => (data.topic && data.topic.trim().length > 0) || (data.text && data.text.trim().length > 0), {
  message: 'Topik atau teks materi harus disertakan minimal satu.',
});

export const tutorChatSchema = z.object({
  message: z.string().min(1, 'Pesan tidak boleh kosong'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'model']),
    content: z.string()
  })).optional().default([]),
  contextLesson: z.object({
    title: z.string().optional(),
    overview: z.string().optional(),
    content: z.string().optional(),
    keyConcepts: z.any().optional(),
  }).optional(),
  explanationStyle: z.string().optional(),
});

export const generateFlashcardsSchema = z.object({
  lessonTitle: z.string().min(1),
  content: z.string().min(10, 'Konten materi terlalu singkat untuk dibuat flashcard'),
  count: z.number().min(3).max(20).default(6),
  subject: z.string().optional().default('Umum'),
});

export const generateQuizSchema = z.object({
  lessonTitle: z.string().min(1),
  content: z.string().min(10, 'Konten materi terlalu singkat untuk dibuat kuis'),
  count: z.number().min(3).max(15).default(5),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
});

export const generateExamSchema = z.object({
  subject: z.string().min(1),
  lessonTitles: z.array(z.string()).min(1),
  contentSummary: z.string().optional(),
  count: z.number().min(5).max(25).default(10),
  difficulty: z.enum(['medium', 'hard']).default('hard'),
  timeMinutes: z.number().min(10).max(120).default(30),
});
