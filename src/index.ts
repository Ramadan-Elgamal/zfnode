#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { Command } from 'commander';
import pc from 'picocolors';
import { runPromptFunnel } from './prompts.js';
import { executeScaffoldingPipeline } from './generator.js';
import { scanWorkspace, fileExists } from './utils/workspace.js';
import { parseEntityName, hydrateStub } from './utils/stub.js';

const program = new Command();

program
  .name('create-node-blueprint')
  .description('Enterprise Node.js & TypeScript API scaffolding and daily code generation engine')
  .version('1.0.0');

// ==========================================
// ROUTE 1: PRIMARY SCAFFOLDING FUNNEL
// ==========================================
program
  .action(async () => {
    if (program.args.length > 0) {
      console.error(pc.red(`❌ Unknown command: ${program.args.join(' ')}`));
      console.log(`👉 Run ${pc.cyan('create-node-blueprint --help')} to view available operations.`);
      process.exit(1);
    }

    try {
      const config = await runPromptFunnel();
      await executeScaffoldingPipeline(config);
    } catch (error) {
      console.error(pc.red('🚨 Pipeline execution terminated unexpectedly.'));
      process.exit(1);
    }
  });

// ==========================================
// ROUTE 2: ARTISAN ONGOING GENERATORS
// ==========================================

program
  .command('make:controller <name>')
  .description('Scaffold a new domain controller pre-wired with standard HTTP transport logic')
  .action(async (name: string) => {
    const context = await scanWorkspace();
    const names = parseEntityName(name);
    
    const targetDir = path.join(context.srcDir, 'controllers');
    const destPath = path.join(targetDir, `${names.kebabName}.controller.${context.ext}`);

    console.log(pc.cyan(`⚡ Scaffolding Controller [${pc.bold(names.pascalName)}] targeting ${context.ext.toUpperCase()} output...`));

    if (await fileExists(destPath)) {
      console.error(pc.red(`❌ Aborted: Target controller asset already exists at [${destPath}]`));
      process.exit(1);
    }

    try {
      await fs.mkdir(targetDir, { recursive: true });
      const content = await hydrateStub('controller.standalone', names, context.isTS);
      await fs.writeFile(destPath, content.trim() + '\n', 'utf-8');
      
      console.log(pc.green(`✔ Successfully generated independent controller: ${pc.bold(destPath)}`));
    } catch (error: any) {
      console.error(pc.red(`🚨 Execution failed: ${error.message || 'Unable to compile file context.'}`));
      process.exit(1);
    }
  });

program
  .command('make:service <name>')
  .description('Scaffold a decoupled business logic execution engine')
  .action(async (name: string) => {
    const context = await scanWorkspace();
    const names = parseEntityName(name);
    
    const targetDir = path.join(context.srcDir, 'services');
    const destPath = path.join(targetDir, `${names.kebabName}.service.${context.ext}`);

    console.log(pc.cyan(`⚡ Scaffolding Service [${pc.bold(names.pascalName)}] targeting ${context.ext.toUpperCase()} output...`));

    if (await fileExists(destPath)) {
      console.error(pc.red(`❌ Aborted: Target service asset already exists at [${destPath}]`));
      process.exit(1);
    }

    try {
      await fs.mkdir(targetDir, { recursive: true });
      const content = await hydrateStub('service', names, context.isTS);
      await fs.writeFile(destPath, content.trim() + '\n', 'utf-8');
      
      console.log(pc.green(`✔ Successfully generated service: ${pc.bold(destPath)}`));
    } catch (error: any) {
      console.error(pc.red(`🚨 Execution failed: ${error.message || 'Unable to compile file context.'}`));
      process.exit(1);
    }
  });

program
  .command('make:route <name>')
  .description('Scaffold an API routing profile mapped cleanly to domain targets')
  .action(async (name: string) => {
    const context = await scanWorkspace();
    const names = parseEntityName(name);
    
    const targetDir = path.join(context.srcDir, 'routes');
    const destPath = path.join(targetDir, `${names.kebabName}.routes.${context.ext}`);

    console.log(pc.cyan(`⚡ Scaffolding Route [${pc.bold(names.pascalName)}] targeting ${context.ext.toUpperCase()} output...`));

    if (await fileExists(destPath)) {
      console.error(pc.red(`❌ Aborted: Target routing asset already exists at [${destPath}]`));
      process.exit(1);
    }

    try {
      await fs.mkdir(targetDir, { recursive: true });
      const content = await hydrateStub('route.standalone', names, context.isTS);
      await fs.writeFile(destPath, content.trim() + '\n', 'utf-8');
      
      console.log(pc.green(`✔ Successfully generated independent route: ${pc.bold(destPath)}`));
    } catch (error: any) {
      console.error(pc.red(`🚨 Execution failed: ${error.message || 'Unable to compile file context.'}`));
      process.exit(1);
    }
  });

// ==========================================
// COMMIT 4: THE VERTICAL SLICE (RESOURCE)
// ==========================================
program
  .command('make:resource <name>')
  .description('Generate a complete vertical domain slice (Controller, Service, Route concurrently)')
  .action(async (name: string) => {
    const context = await scanWorkspace();
    const names = parseEntityName(name);

    console.log(pc.cyan(`🚀 Scaffolding Full Resource Slice for [${pc.bold(names.pascalName)}] targeting ${context.ext.toUpperCase()} output...`));

    // Map out explicit destination paths
    const controllerDir = path.join(context.srcDir, 'controllers');
    const serviceDir = path.join(context.srcDir, 'services');
    const routeDir = path.join(context.srcDir, 'routes');

    const controllerPath = path.join(controllerDir, `${names.kebabName}.controller.${context.ext}`);
    const servicePath = path.join(serviceDir, `${names.kebabName}.service.${context.ext}`);
    const routePath = path.join(routeDir, `${names.kebabName}.routes.${context.ext}`);

    // Perform concurrent evaluation to intercept existing structures instantly
    const fileVerifications = await Promise.all([
      fileExists(controllerPath),
      fileExists(servicePath),
      fileExists(routePath),
    ]);

    if (fileVerifications.includes(true)) {
      console.error(pc.red(`❌ Aborted: One or more resource assets already exist for [${names.kebabName}].`));
      console.log(pc.yellow(`👉 Please verify your target controllers, services, or routes directories to avoid state fragmentation.`));
      process.exit(1);
    }

    try {
      // Establish missing target layout frameworks concurrently
      await Promise.all([
        fs.mkdir(controllerDir, { recursive: true }),
        fs.mkdir(serviceDir, { recursive: true }),
        fs.mkdir(routeDir, { recursive: true }),
      ]);

      // Hydrate core templates asynchronously in parallel
      const [controllerContent, serviceContent, routeContent] = await Promise.all([
        hydrateStub('controller.resource', names, context.isTS),
        hydrateStub('service', names, context.isTS),
        hydrateStub('route.resource', names, context.isTS),
      ]);

      // Write compiled stream outputs to disk storage
      await Promise.all([
        fs.writeFile(controllerPath, controllerContent.trim() + '\n', 'utf-8'),
        fs.writeFile(servicePath, serviceContent.trim() + '\n', 'utf-8'),
        fs.writeFile(routePath, routeContent.trim() + '\n', 'utf-8'),
      ]);

      // Output tailored operational log summaries
      console.log('');
      console.log(pc.green(`✔ Vertical domain resource slice generated successfully!`));
      console.log(pc.gray('-------------------------------------------------------------------'));
      console.log(`📁 ${pc.bold('Controller:')} ${pc.cyan(path.relative(context.rootDir, controllerPath))}`);
      console.log(`📁 ${pc.bold('Service:')}    ${pc.cyan(path.relative(context.rootDir, servicePath))}`);
      console.log(`📁 ${pc.bold('Route:')}      ${pc.cyan(path.relative(context.rootDir, routePath))}`);
      console.log(pc.gray('-------------------------------------------------------------------'));
      
      // Print actionable setup integration mapping instructions
      console.log(pc.bold('👉 Next Step (Mount your route):'));
      console.log(`   Open ${pc.cyan(`src/app.${context.ext}`)} and mount your new domain profile:`);
      console.log('');
      console.log(pc.yellow(`   import ${names.camelName}Routes from './routes/${names.kebabName}.routes.js';`));
      console.log(pc.yellow(`   app.use('/api/v1/${names.kebabName}s', ${names.camelName}Routes);`));
      console.log('');
    } catch (error: any) {
      console.error(pc.red(`🚨 Execution failed during vertical slice compilation: ${error.message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);