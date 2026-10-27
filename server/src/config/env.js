import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/researchgpt'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long').default('development_jwt_secret_must_be_changed_in_prod_12345678'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  TAVILY_API_KEY: z.string().optional().default(''),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  RESEARCH_THRESHOLD: z.coerce.number().default(3),
  MOCK_MODE: z
    .enum(['true', 'false', ''])
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return null;
    }),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const rawEnv = parsed.data;

// Automatically determine mock mode if not explicitly set
const isMockMode =
  rawEnv.MOCK_MODE !== null
    ? rawEnv.MOCK_MODE
    : !rawEnv.GEMINI_API_KEY || !rawEnv.TAVILY_API_KEY;

export const env = {
  ...rawEnv,
  IS_MOCK_MODE: isMockMode,
};
