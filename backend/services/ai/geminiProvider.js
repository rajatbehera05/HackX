import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiProvider {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    this.client = null;

    if (this.apiKey) {
      this.client = new GoogleGenerativeAI(this.apiKey);
    } else {
      console.warn('⚠️ [GeminiProvider] GEMINI_API_KEY is not defined in environment variables.');
    }
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey !== 'your_gemini_api_key_here');
  }

  /**
   * Cleans raw text that may contain markdown code fences
   */
  cleanJsonText(raw) {
    if (!raw) return '';
    let text = raw.trim();
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return text.trim();
  }

  /**
   * Generates structured JSON from Gemini using system instruction and prompt
   */
  async generateJson({ systemPrompt, userPrompt, temperature = 0.4 }) {
    if (!this.isConfigured()) {
      throw new Error(
        'Gemini API key is not configured. Please set GEMINI_API_KEY in backend/.env'
      );
    }

    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature,
      },
    });

    try {
      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const rawText = response.text();

      const cleaned = this.cleanJsonText(rawText);
      try {
        return JSON.parse(cleaned);
      } catch (parseError) {
        console.warn('⚠️ JSON parse failed on first pass. Attempting salvage...', parseError.message);
        // Find first '{' or '[' and last '}' or ']'
        const firstBrace = cleaned.search(/[{\[]/);
        const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
        if (firstBrace !== -1 && lastBrace !== -1) {
          const substring = cleaned.substring(firstBrace, lastBrace + 1);
          return JSON.parse(substring);
        }
        throw new Error(`Malformed AI JSON response: ${parseError.message}`);
      }
    } catch (err) {
      // Check for rate limit or quota errors
      if (err.status === 429 || (err.message && err.message.includes('RESOURCE_EXHAUSTED'))) {
        throw new Error('Gemini API rate limit or quota reached. Please wait a moment before trying again.');
      }
      throw err;
    }
  }
}

export const geminiProvider = new GeminiProvider();
