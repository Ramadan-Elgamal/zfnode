import prompts from 'prompts';
import pc from 'picocolors';

// 1. UPDATED: Expanded configuration state interface
export interface ScaffoldingConfig {
  projectName: string;
  port: number;
  language: 'typescript' | 'javascript';
  preset: 'minimal' | 'production' | 'enterprise';
  moduleResolution?: 'NodeNext' | 'CommonJS';
  // Future properties will append here
}

const handleCancel = () => {
  console.log('');
  console.log(pc.yellow('⚠️ Scaffolding aborted by user. Exiting cleanly...'));
  process.exit(0);
};

export const runPromptFunnel = async (): Promise<Partial<ScaffoldingConfig>> => {
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

      // ==========================================
      // NEW CONDITIONAL PROMPTS ADDED BELOW
      // ==========================================

      // 4. GATEWAY PRESET (Only triggers if language === 'typescript')
      {
        // Dynamically evaluate if this prompt should render
        type: (prev, values) => (values.language === 'typescript' ? 'select' : null),
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
        initial: 1, // Defaults to Standard Production
      },

      // 5. MODULE RESOLUTION (Only triggers for TS + Production/Enterprise presets)
      {
        type: (prev, values) => {
          // Skip if JS was chosen OR if they chose the minimal TS learner base
          if (values.language !== 'typescript' || values.preset === 'minimal') {
            return null;
          }
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
    ],
    {
      onCancel: handleCancel,
    }
  );

  // Fallback cleanup: If JavaScript was chosen, hardcode the preset to minimal behind the scenes
  if (answers.language === 'javascript') {
    answers.preset = 'minimal';
  }

  return answers as Partial<ScaffoldingConfig>;
};