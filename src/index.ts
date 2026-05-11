#!/usr/bin/env node

import { Command } from 'commander';
import pc from 'picocolors';

// Initialize the primary CLI program
const program = new Command();

program
  .name('create-node-blueprint')
  .description('Interactive scaffolding CLI for enterprise Node.js & TypeScript architectures')
  .version('1.0.0')
  .action(async () => {
    // Print a clean, colorized welcome banner
    console.log('');
    console.log(pc.bold(pc.cyan('🚀 Welcome to Create Node Blueprint')));
    console.log(pc.gray('==================================================='));
    console.log(pc.green('Initializing interactive scaffolding pipeline...'));
    console.log('');

    // TODO: Phase 2 prompts integration will mount here
  });

// FIXED: Execute the parser against the incoming terminal arguments
program.parse(process.argv);