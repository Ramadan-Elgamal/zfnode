import prompts from 'prompts';
import pc from 'picocolors';

// 1. FINALIZED: Complete configuration state interface
export interface ScaffoldingConfig {
  projectName: string;
  port: number;
  language: 'typescript' | 'javascript';
  preset: 'minimal' | 'production' | 'enterprise';
  moduleResolution?: 'NodeNext' | 'CommonJS';
  database?: 'mongodb' | 'postgres' | 'mysql';
  features?: {
    redis: boolean;
    bullmq: boolean;
    ai: boolean;
    sockets: boolean;
    s3: boolean;
    n8n: boolean;
  };
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun';
}

const handleCancel = () => {
  console.log('');
  console.log(pc.yellow('⚠️ Scaffolding aborted by user. Exiting cleanly...'));
  process.exit(0);
};

export const runPromptFunnel = async (): Promise<ScaffoldingConfig> => {
  console.log(pc.cyan('📋 Gathering project configuration...'));
  console.log('');

  const answers = await prompts(
    [
      // 1. PROJECT NAME
      {
        type: 'text',
        name: 'projectName',
        message: 'What is your project named?',
        initial: 'my-node-blueprint',
        validate: (value: string) => {
          if (!value.trim()) return 'Project name cannot be empty.';
          if (/[^a-zA-Z0-9-_]/.test(value)) {
            return 'Project name can only contain letters, numbers, dashes, and underscores.';
          }
          return true;
        },
      },

      // 2. NETWORK PORT
      {
        type: 'text',
        name: 'port',
        message: 'Which local port should the API bind to?',
        initial: '3000',
        validate: (value: string) => {
          const parsed = parseInt(value.trim(), 10);
          if (isNaN(parsed) || parsed < 1024 || parsed > 65535) {
            return 'Please enter a valid port number between 1024 and 65535.';
          }
          return true;
        },
        format: (value: string) => parseInt(value.trim(), 10),
      },

      // 3. LANGUAGE CHOICE
      {
        type: 'select',
        name: 'language',
        message: 'Which language do you want to use?',
        choices: [
          { title: pc.blue('TypeScript') + pc.gray(' (Strongly-typed, enterprise ready)'), value: 'typescript' },
          { title: pc.yellow('JavaScript') + pc.gray(' (Pure ES6+, fast prototyping)'), value: 'javascript' },
        ],
        initial: 0,
      },

      // 4. GATEWAY PRESET
      {
        // Change prev to _prev
type: (_prev, values) => (values.language === 'typescript' ? 'select' : null),
        name: 'preset',
        message: 'Select a Workspace Preset:',
        choices: [
          { 
            title: pc.green('Minimal / Learner'), 
            description: 'Clean Express base, standard error handling, basic console logs. No Docker/Jest.', 
            value: 'minimal' 
          },
          { 
            title: pc.cyan('Standard Production'), 
            description: 'Highly optimized core. Pino JSON logging, complete Jest testing, lean Dockerfile.', 
            value: 'production' 
          },
          { 
            title: pc.magenta('Enterprise / Custom'), 
            description: 'Full à la carte menu. Choose optional plugins (Redis, Queues, AI Gateway, n8n, etc.).', 
            value: 'enterprise' 
          },
        ],
        initial: 1,
      },

      // 5. MODULE RESOLUTION
      {
        // Change prev to _prev
type: (_prev, values) => {
  if (values.language !== 'typescript' || values.preset === 'minimal') return null;
  return 'select';
},
        name: 'moduleResolution',
        message: 'Choose your Module Resolution standard:',
        choices: [
          { title: 'Native ESM ' + pc.gray('(NodeNext / Modern standard)'), value: 'NodeNext' },
          { title: 'CommonJS ' + pc.gray('(Traditional require() interoperability)'), value: 'CommonJS' },
        ],
        initial: 0,
      },

      // 6. DATABASE SELECTION
      {
        // Change prev to _prev
        type: (_prev, values) => (values.preset === 'enterprise' ? 'select' : null),
        name: 'database',
        message: 'Select your primary Database engine:',
        choices: [
          { title: 'MongoDB ' + pc.green('(Mongoose Adapter)'), value: 'mongodb' },
          { title: 'PostgreSQL ' + pc.cyan('(Prisma Adapter)'), value: 'postgres' },
          { title: 'MySQL ' + pc.blue('(Prisma Adapter)'), value: 'mysql' },
        ],
        initial: 0,
      },

      // 7. À LA CARTE ADVANCED MODULES
      {
        type: (_prev, values) => (values.preset === 'enterprise' ? 'multiselect' : null),
        name: 'rawFeatures',
        message: 'Select optional enterprise modules to install:',
        instructions: pc.gray(' (Press <space> to select, <a> to toggle all, <return> to submit)'),
        choices: [
          { title: '⚡ High-Performance Caching ' + pc.gray('(Redis)'), value: 'redis' },
          { title: '📬 Asynchronous Background Jobs ' + pc.gray('(BullMQ)'), value: 'bullmq' },
          { title: '🤖 Dynamic AI Gateway & Vectors ' + pc.gray('(OpenAI/Gemini/RAG)'), value: 'ai' },
          { title: '🔄 Real-Time Communication ' + pc.gray('(Socket.io)'), value: 'sockets' },
          { title: '☁️ Secure Cloud File Management ' + pc.gray('(Pre-signed S3 URLs)'), value: 's3' },
          { title: '⚙️ Enterprise Workflow Automation ' + pc.gray('(n8n Webhook/Callbacks)'), value: 'n8n' },
        ],
      },

      // ==========================================
      // NEW PROMPT: PACKAGE MANAGER TARGET
      // ==========================================
      // 8. PACKAGE MANAGER SELECTION
      {
        type: 'select',
        name: 'packageManager',
        message: 'Which package manager do you use?',
        choices: [
          { title: pc.red('npm') + pc.gray(' (Standard node package manager)'), value: 'npm' },
          { title: pc.yellow('pnpm') + pc.gray(' (Fast, disk-space efficient)'), value: 'pnpm' },
          { title: pc.blue('yarn') + pc.gray(' (Classic deterministic client)'), value: 'yarn' },
          { title: pc.cyan('bun') + pc.gray(' (Blazing fast all-in-one toolkit)'), value: 'bun' },
        ],
        initial: 0,
      },
    ],
    {
      onCancel: handleCancel,
    }
  );

  // ==========================================
  // SMART STATE ACCUMULATION & OVERRIDES
  // ==========================================

  if (answers.language === 'javascript') {
    answers.preset = 'minimal';
  }

  if (answers.preset !== 'enterprise') {
    answers.database = 'mongodb';
  }

  const selectedFeatures: string[] = answers.rawFeatures || [];
  
  const features = {
    redis: selectedFeatures.includes('redis'),
    bullmq: selectedFeatures.includes('bullmq'),
    ai: selectedFeatures.includes('ai'),
    sockets: selectedFeatures.includes('sockets'),
    s3: selectedFeatures.includes('s3'),
    n8n: selectedFeatures.includes('n8n'),
  };

  if (features.bullmq || features.sockets) {
    features.redis = true;
  }

  delete answers.rawFeatures;
  
  // Return the strictly typed, complete configuration store
  return {
    ...answers,
    features,
  } as ScaffoldingConfig;
};