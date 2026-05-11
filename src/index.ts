#!/usr/bin/env node

import { Command } from 'commander';
import pc from 'picocolors';
import { runPromptFunnel } from './prompts'; // <-- 1. Import the funnel

const program = new Command();

program
  .name('create-node-blueprint')
  .description('Interactive scaffolding CLI for enterprise Node.js & TypeScript architectures')
  .version('1.0.0')
  .action(async () => {
    console.log('');
    console.log(pc.bold(pc.cyan('🚀 Welcome to Create Node Blueprint')));
    console.log(pc.gray('==================================================='));
    console.log('');

    // <-- 2. Execute the interactive funnel
    const config = await runPromptFunnel();

    // Temporary debug print to verify state accumulation
    console.log('');
    console.log(pc.green('✔ Initial configuration captured successfully:'));
    console.log(config);
  });

program.parse(process.argv);