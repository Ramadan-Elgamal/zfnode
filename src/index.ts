#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { Command } from 'commander';
import pc from 'picocolors';
import prompts from 'prompts';
import { runPromptFunnel } from './prompts.js';
import { executeScaffoldingPipeline } from './generator.js';
import { scanWorkspace, fileExists, toPosixPath } from './utils/workspace.js';
import { parseEntityName, hydrateStub } from './utils/stub.js';
import { injectRouteIntoApp } from './utils/injector.js';

const program = new Command();

program
  .name('zfnode')
  .description('Zero Friction Node.js API scaffolding and automated daily code generation bot')
  .version('1.1.0');

// Helper to interactively resolve entity names if the user drops command arguments
const resolveEntityName = async (providedName?: string, entityType: string = 'Resource'): Promise<string> => {
  if (providedName && providedName.trim()) return providedName.trim();
  
  console.log('');
  const response = await prompts({
    type: 'text',
    name: 'entityName',
    message: `Enter the target name for your ${entityType} (e.g., User, ProductOrder):`,
    validate: (val) => (val.trim().length > 0 ? true : 'Entity name cannot be blank.'),
  });

  if (!response.entityName) {
    console.error(pc.red('❌ Aborted: Entity name resolution required to proceed.'));
    process.exit(1);
  }

  return response.entityName.trim();
};

// ==========================================
// ROUTE 1: PRIMARY SCAFFOLDING FUNNEL
// ==========================================
program
  .action(async () => {
    if (program.args.length > 0) {
      console.error(pc.red(`❌ Unknown command: ${program.args.join(' ')}`));
      console.log(`👉 Run ${pc.cyan('zfnode --help')} to view available operations.`);
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
  .command('bot:controller [name]')
  .description('Instruct the bot to scaffold an independent HTTP domain controller')
  .action(async (name?: string) => {
    const resolvedName = await resolveEntityName(name, 'Controller');
    const context = await scanWorkspace();
    const names = parseEntityName(resolvedName);
    
    const targetDir = path.join(context.srcDir, 'controllers');
    const destPath = path.join(targetDir, `${names.kebabName}.controller.${context.ext}`);

    console.log(pc.cyan(`🤖 Bot crafting Controller [${pc.bold(names.pascalName)}]...`));

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
  .command('bot:service [name]')
  .description('Instruct the bot to scaffold a decoupled business logic service')
  .action(async (name?: string) => {
    const resolvedName = await resolveEntityName(name, 'Service');
    const context = await scanWorkspace();
    const names = parseEntityName(resolvedName);
    
    const targetDir = path.join(context.srcDir, 'services');
    const destPath = path.join(targetDir, `${names.kebabName}.service.${context.ext}`);

    console.log(pc.cyan(`🤖 Bot crafting Service [${pc.bold(names.pascalName)}]...`));

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
  .command('bot:route [name]')
  .description('Instruct the bot to scaffold an independent API routing profile')
  .action(async (name?: string) => {
    const resolvedName = await resolveEntityName(name, 'Route');
    const context = await scanWorkspace();
    const names = parseEntityName(resolvedName);
    
    const targetDir = path.join(context.srcDir, 'routes');
    const destPath = path.join(targetDir, `${names.kebabName}.routes.${context.ext}`);

    console.log(pc.cyan(`🤖 Bot crafting Route [${pc.bold(names.pascalName)}]...`));

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

program
  .command('bot:resource [name]')
  .description('Instruct the bot to generate and mount a complete vertical domain slice')
  .action(async (name?: string) => {
    const resolvedName = await resolveEntityName(name, 'Resource Slice');
    const context = await scanWorkspace();
    const names = parseEntityName(resolvedName);

    console.log(pc.cyan(`🚀 Bot deploying Full Resource Slice for [${pc.bold(names.pascalName)}]...`));

    const controllerDir = path.join(context.srcDir, 'controllers');
    const serviceDir = path.join(context.srcDir, 'services');
    const routeDir = path.join(context.srcDir, 'routes');

    const controllerPath = path.join(controllerDir, `${names.kebabName}.controller.${context.ext}`);
    const servicePath = path.join(serviceDir, `${names.kebabName}.service.${context.ext}`);
    const routePath = path.join(routeDir, `${names.kebabName}.routes.${context.ext}`);

    const fileVerifications = await Promise.all([
      fileExists(controllerPath),
      fileExists(servicePath),
      fileExists(routePath),
    ]);

    if (fileVerifications.includes(true)) {
      console.error(pc.red(`❌ Aborted: One or more resource assets already exist for [${names.kebabName}].`));
      process.exit(1);
    }

    try {
      await Promise.all([
        fs.mkdir(controllerDir, { recursive: true }),
        fs.mkdir(serviceDir, { recursive: true }),
        fs.mkdir(routeDir, { recursive: true }),
      ]);

      const [controllerContent, serviceContent, routeContent] = await Promise.all([
        hydrateStub('controller.resource', names, context.isTS),
        hydrateStub('service', names, context.isTS),
        hydrateStub('route.resource', names, context.isTS),
      ]);

      await Promise.all([
        fs.writeFile(controllerPath, controllerContent.trim() + '\n', 'utf-8'),
        fs.writeFile(servicePath, serviceContent.trim() + '\n', 'utf-8'),
        fs.writeFile(routePath, routeContent.trim() + '\n', 'utf-8'),
      ]);

      // Safely apply POSIX slash translations for cross-platform log outputs
      const relController = toPosixPath(path.relative(context.rootDir, controllerPath));
      const relService = toPosixPath(path.relative(context.rootDir, servicePath));
      const relRoute = toPosixPath(path.relative(context.rootDir, routePath));

      console.log('');
      console.log(pc.green(`✔ Vertical domain resource slice generated successfully!`));
      console.log(pc.gray('-------------------------------------------------------------------'));
      console.log(`📁 ${pc.bold('Controller:')} ${pc.cyan(relController)}`);
      console.log(`📁 ${pc.bold('Service:')}    ${pc.cyan(relService)}`);
      console.log(`📁 ${pc.bold('Route:')}      ${pc.cyan(relRoute)}`);
      console.log(pc.gray('-------------------------------------------------------------------'));
      
      // ==========================================
      // AUTOMATED ROUTE INJECTION EXECUTION
      // ==========================================
      console.log(pc.cyan(`🔄 Attempting automated route injection into src/app.${context.ext}...`));
      const routeMounted = await injectRouteIntoApp(context, names);

      if (routeMounted) {
        console.log(pc.green(`✔ Route dynamically imported and mounted inside application core!`));
        console.log(pc.gray(`  Mounted: app.use('/api/v1/${names.kebabName}s', ${names.camelName}Routes);`));
        console.log('');
      } else {
        console.log(pc.yellow(`○ Auto-mount bypassed. Please mount manually in src/app.${context.ext}`));
        console.log(pc.bold('👉 Next Step (Mount manually):'));
        console.log(`   Open ${pc.cyan(`src/app.${context.ext}`)} and mount your new domain profile:`);
        console.log('');
        console.log(pc.yellow(`   import ${names.camelName}Routes from './routes/${names.kebabName}.routes.js';`));
        console.log(pc.yellow(`   app.use('/api/v1/${names.kebabName}s', ${names.camelName}Routes);`));
        console.log('');
      }
    } catch (error: any) {
      console.error(pc.red(`🚨 Execution failed during vertical slice compilation: ${error.message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);