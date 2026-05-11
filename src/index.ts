#!/usr/bin/env node

import { Command } from 'commander';
import pc from 'picocolors';
import { runPromptFunnel } from './prompts.js';
import { executeScaffoldingPipeline } from './generator.js'; // <-- 1. Import Generator Engine

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

    // Capture validated parameters
    const config = await runPromptFunnel();

    // Trigger physical file generation lifecycle
    await executeScaffoldingPipeline(config);
  });

program.parse(process.argv);