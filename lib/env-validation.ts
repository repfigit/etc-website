/**
 * Environment variable validation
 * Validates required environment variables at startup
 */

interface EnvConfig {
  MONGODB_URI: string;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
  NODE_ENV: string;
}

export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Required environment variables
  const requiredVars = {
    MONGODB_URI: process.env.MONGODB_URI,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'development'
  };

  // Check for missing variables
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  // Validate specific formats
  if (requiredVars.MONGODB_URI && !requiredVars.MONGODB_URI.startsWith('mongodb')) {
    errors.push('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  }

  if (requiredVars.ADMIN_PASSWORD && requiredVars.ADMIN_PASSWORD.length < 8) {
    errors.push('ADMIN_PASSWORD must be at least 8 characters long');
  }

  if (requiredVars.JWT_SECRET && requiredVars.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long for security');
  }

  // Throw error if validation fails
  if (errors.length > 0) {
    const errorMessage = `
╔═══════════════════════════════════════════════════════════════╗
║                   ENVIRONMENT VALIDATION ERROR                 ║
╚═══════════════════════════════════════════════════════════════╝

The following environment variable issues were found:

${errors.map(err => `  ❌ ${err}`).join('\n')}

Please check your .env file and ensure all required variables are set.

For setup instructions, see: ENVIRONMENT_SETUP.md
    `.trim();

    throw new Error(errorMessage);
  }

  return requiredVars as EnvConfig;
}

// Export validated env (only call once at startup)
let _env: EnvConfig | null = null;

export function getValidatedEnv(): EnvConfig {
  if (!_env) {
    _env = validateEnv();
  }
  return _env;
}
