// Mock de reCAPTCHA para testing
export const mockRecaptchaValidation = {
  success: true,
  score: 0.9,
  action: 'register',
  challenge_ts: new Date().toISOString(),
  hostname: 'localhost',
};

// Mock de axios para reCAPTCHA
export const mockAxiosPost = jest.fn().mockResolvedValue({
  data: mockRecaptchaValidation,
});

// Configurar mock de axios antes de importar el servicio
jest.mock('axios', () => ({
  default: {
    post: mockAxiosPost,
  },
  post: mockAxiosPost,
}));
