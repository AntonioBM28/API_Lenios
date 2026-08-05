import { ConfigService } from '@nestjs/config';
import { GroqTextGeneratorService } from './groq-text-generator.service';

const mockCreate = jest.fn();

jest.mock('groq-sdk', () => ({
  Groq: jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  })),
}));

describe('GroqTextGeneratorService', () => {
  let service: GroqTextGeneratorService;

  beforeEach(() => {
    mockCreate.mockReset();
    const configService = {
      get: jest.fn().mockReturnValue('fake-api-key'),
    } as unknown as ConfigService;
    service = new GroqTextGeneratorService(configService);
  });

  it('devuelve el contenido del primer choice', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'hola' } }],
    });

    const result = await service.complete('di hola');

    expect(result).toBe('hola');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'openai/gpt-oss-120b' }),
    );
  });

  it('devuelve string vacío si la respuesta no trae choices', async () => {
    mockCreate.mockResolvedValue({ choices: [] });

    const result = await service.complete('...');

    expect(result).toBe('');
  });

  it('propaga el error si la llamada a Groq falla', async () => {
    mockCreate.mockRejectedValue(new Error('rate limit exceeded'));

    await expect(service.complete('...')).rejects.toThrow(
      'rate limit exceeded',
    );
  });
});
