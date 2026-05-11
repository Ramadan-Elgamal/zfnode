import prompts from 'prompts';
import pc from 'picocolors';

// Define the structure of our accumulated user choices
export interface ScaffoldingConfig {
  projectName: string;
  port: number;
  language: 'typescript' | 'javascript';
  // Future properties from upcoming commits will be appended here
}

/**
 * Helper function to handle safe terminal exits if the user presses Ctrl+C
 */
const handleCancel = () => {
  console.log('');
  console.log(pc.yellow('⚠️ Scaffolding aborted by user. Exiting cleanly...'));
  process.exit(0);
};

/**
 * Executes the interactive prompt flow to gather workspace configuration
 */
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

      // 2. NETWORK PORT (Upgraded to Text + Casting for flawless UX)
      {
        type: 'text',
        name: 'port',
        message: 'Which local port should the API bind to?',
        initial: '3000', // Set initial as string so the terminal renders it cleanly
        validate: (value: string) => {
          const parsed = parseInt(value.trim(), 10);
          if (isNaN(parsed) || parsed < 1024 || parsed > 65535) {
            return 'Please enter a valid port number between 1024 and 65535.';
          }
          return true;
        },
        // CRITICAL: Transforms the string answer back into a strict number for our engine
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
        initial: 0, // Defaults to TypeScript
      },
    ],
    {
      onCancel: handleCancel,
    }
  );

  return answers as Partial<ScaffoldingConfig>;
};