import { OPENROUTER_CONFIG } from '../constants/api';
import { Question } from './spacedRepetition';
import i18n from '../i18n';

// Lưu chỉ mục của API Key hoạt động tốt gần nhất
let currentKeyIndex = 0;

/**
 * Generate a dynamic TOEIC question using OpenRouter API
 * @param usedQuestions List of recently used question texts or vocab words to avoid duplicates
 */
export async function generateOpenRouterQuestion(usedQuestions: string[]): Promise<Question> {
  const keys = OPENROUTER_CONFIG.API_KEYS;

  if (!keys || keys.length === 0) {
    throw new Error('No valid OpenRouter API Keys configured in environment variables');
  }

  const explanationLang = i18n.language === 'en' ? 'English' : 'Vietnamese';

  const systemPrompt = `You are a professional TOEIC test generator. Generate a brand new, highly realistic Part 5 (Incomplete Sentences) or Vocabulary question.
You must output ONLY a valid JSON object matching this schema:
{
  "question": "string (sentence with _______ for the blank space)",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": 0 (index of correct option 0-3),
  "explanation": "string (brief explanation in ${explanationLang} about grammar/vocabulary choice)"
}

Do not include any markdown styling, code blocks, or extra text. Output only raw JSON.`;

  const userPrompt = `Generate a unique TOEIC question.
${usedQuestions.length > 0 ? `Do NOT generate questions related to these concepts or words: ${usedQuestions.join(', ')}.` : ''}`;

  let attempts = 0;
  const maxAttempts = keys.length;

  while (attempts < maxAttempts) {
    const activeIndex = (currentKeyIndex + attempts) % keys.length;
    const apiKey = keys[activeIndex];

    try {
      const response = await fetch(OPENROUTER_CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://github.com/pentapperthanh123/block-blast-clone',
          'X-Title': 'Block Blast TOEIC Clone',
        },
        body: JSON.stringify({
          model: OPENROUTER_CONFIG.MODEL,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 400,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content;

      if (!rawText) {
        throw new Error('Empty response from LLM');
      }

      // Parse JSON
      const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedText);

      // Validate parsed structure
      if (
        typeof parsed.question === 'string' &&
        Array.isArray(parsed.options) &&
        parsed.options.length === 4 &&
        typeof parsed.correctAnswer === 'number' &&
        parsed.correctAnswer >= 0 &&
        parsed.correctAnswer <= 3 &&
        typeof parsed.explanation === 'string'
      ) {
        // Lưu lại vị trí của key thành công để dùng ngay cho lần sau
        currentKeyIndex = activeIndex;
        return {
          id: `openrouter_${Date.now()}`,
          question: parsed.question,
          options: parsed.options,
          correctAnswer: parsed.correctAnswer,
          explanation: parsed.explanation,
        };
      } else {
        throw new Error('Invalid JSON format returned from LLM');
      }
    } catch (error) {
      console.warn(`Attempt with API Key index ${activeIndex} failed:`, error);
      attempts++;
    }
  }

  throw new Error('All configured OpenRouter API Keys failed to generate a question');
}
