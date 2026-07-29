export const OPENROUTER_CONFIG = {
  // Đọc danh sách các API Keys phân cách bởi dấu phẩy từ biến môi trường
  API_KEYS: (process.env.EXPO_PUBLIC_OPENROUTER_KEYS || '')
    .split(',')
    .map((key: string) => key.trim())
    .filter((key: string) => key.length > 0 && !key.includes('placeholder')),
  // Model sử dụng (Ưu tiên gemini-2.5-flash hoặc các model free để có tốc độ phản hồi nhanh nhất)
  MODEL: 'google/gemini-2.5-flash',
  API_URL: 'https://openrouter.ai/api/v1/chat/completions',
};
