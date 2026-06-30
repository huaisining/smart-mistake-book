import { analyzeMistake } from '../src/lib/ai-service';

// Mock fetch for AI service tests
global.fetch = jest.fn();

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.OPENAI_BASE_URL = 'https://api.test.com/v1';
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_BASE_URL;
  });

  describe('analyzeMistake', () => {
    test('should throw error when API key is not configured', async () => {
      delete process.env.OPENAI_API_KEY;
      
      await expect(analyzeMistake(undefined, 'What is 2+2?')).rejects.toThrow(
        'AI API key not configured'
      );
    });

    test('should call AI API with correct parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                title: '加法题',
                answer: '4',
                explanation: '2加2等于4',
                knowledgePoints: ['加法', '基础算术'],
                mistakeType: 'careless',
                difficulty: 1
              })
            }
          }]
        })
      });

      const result = await analyzeMistake(undefined, 'What is 2+2?');
      
      expect(result.title).toBe('加法题');
      expect(result.answer).toBe('4');
      expect(result.explanation).toBe('2加2等于4');
      expect(result.knowledgePoints).toEqual(['加法', '基础算术']);
      expect(result.mistakeType).toBe('careless');
      expect(result.difficulty).toBe(1);
    });

    test('should handle image-based analysis', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                title: '几何题',
                answer: 'πr²',
                explanation: '圆的面积公式',
                knowledgePoints: ['几何', '圆'],
                mistakeType: 'concept',
                difficulty: 3
              })
            }
          }]
        })
      });

      const result = await analyzeMistake('data:image/png;base64,...');
      
      expect(result.title).toBe('几何题');
      expect(global.fetch).toHaveBeenCalled();
    });

    test('should return default values when AI response is invalid', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: { content: '{}' }
          }]
        })
      });

      const result = await analyzeMistake(undefined, 'Test question');
      
      expect(result.title).toBe('未命名题目');
      expect(result.answer).toBe('');
      expect(result.knowledgePoints).toEqual([]);
      expect(result.mistakeType).toBe('concept');
      expect(result.difficulty).toBe(3);
    });
  });
});
