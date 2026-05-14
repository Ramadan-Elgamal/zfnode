import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pc from 'picocolors';
import { ScaffoldingConfig } from './prompts.js';
import { installDependencies, verifyPackageManager, initGitRepository } from './installer.js';
import { ui } from './ui.js';

// Resolve directory paths cleanly within an ES Module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map the absolute path to our static template directory within the published package
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');

/**
 * Recursively copies a directory from source to destination, executing 
 * variable replacement injection on targeted file types.
 */
export const copyTemplateDir = async (srcDir: string, destDir: string, config: ScaffoldingConfig): Promise<void> => {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await copyTemplateDir(srcPath, destPath, config);
    } else {
      // Execute smart variable injection on source files
      await injectTemplateVariables(srcPath, destPath, config);
    }
  }
};

/**
 * Reads a template file, replaces placeholder variables (e.g., {{PORT}}),
 * and writes the compiled output to the target destination.
 */
const injectTemplateVariables = async (srcPath: string, destPath: string, config: ScaffoldingConfig): Promise<void> => {
  // Directly copy binary or non-text files without reading their buffer into memory
  const ext = path.extname(srcPath);
  const binaryExtensions = ['.png', '.jpg', '.ico', '.pdf'];
  
  if (binaryExtensions.includes(ext)) {
    await fs.copyFile(srcPath, destPath);
    return;
  }

  try {
    let content = await fs.readFile(srcPath, 'utf-8');

    // Execute absolute string replacements based on state properties
    content = content.replace(/\{\{PORT\}\}/g, String(config.port));
    content = content.replace(/\{\{PROJECT_NAME\}\}/g, config.projectName);

    await fs.writeFile(destPath, content, 'utf-8');
  } catch (error) {
    console.error(pc.red(`❌ Failed to compile template file: ${srcPath}`));
    throw error;
  }
};

/**
 * Primary orchestration engine triggered by the executable binary.
 */
export const executeScaffoldingPipeline = async (config: ScaffoldingConfig): Promise<void> => {
  const targetWorkspace = path.resolve(process.cwd(), config.projectName);

  console.log('');
  ui.startSpinner(`Establishing directory skeleton for ${config.projectName}...`);

  try {
    await fs.mkdir(targetWorkspace, { recursive: true });

    // 1. Scaffold Core Preset Base
    const presetFolder = config.language === 'javascript' 
      ? 'presets/minimal-js' 
      : `presets/${config.preset === 'minimal' ? 'minimal-ts' : 'advanced-ts'}`;
      
    const presetSrc = path.join(TEMPLATES_DIR, presetFolder);
    await copyTemplateDir(presetSrc, targetWorkspace, config);
    ui.updateSpinner('Generating highly tailored package.json manifest...');

    // 2. Compose Dynamic Dependency Tree
    await composePackageManifest(targetWorkspace, config);

    // 3. Inject DTO Validation Layers
    await injectArchitecturalAdapters(targetWorkspace, config);

    // 4. Stitch Modular Database Connectors
    ui.updateSpinner('Stitching modular persistence layers and database profiles...');
    await stitchDatabaseAdapter(targetWorkspace, config);

    // 5. Selectively Inject Advanced Features
    ui.updateSpinner('Injecting isolated enterprise modules and routing stubs...');
    await injectAdvancedFeatures(targetWorkspace, config);

    // 6. Generate Contextual Environment Files
    await composeEnvironmentVariables(targetWorkspace, config);

    // NEW STEP: Drop instructional onboarding documentation guide into project root
    ui.updateSpinner('Compiling customized instructional project documentation guide...');
    await composeInstructionalReadme(targetWorkspace, config);

    // ==========================================
    // PREVENTATIVE VERIFICATION & INSTALLATION
    // ==========================================
    ui.updateSpinner(`Verifying if host system possesses global binary for [${config.packageManager}]...`);
    const isInstalled = await verifyPackageManager(config.packageManager);

    if (!isInstalled) {
      ui.failSpinner(`Global executable for ${pc.bold(pc.yellow(config.packageManager))} not detected in OS environment.`);
      console.log(pc.yellow(`⚠️ Skipping automated installation lifecycle. Workspace structure generated securely.`));
      
      const fallbackCmd = config.packageManager === 'yarn' ? 'yarn' : `${config.packageManager} install`;
      console.log(pc.gray(`👉 Simply install [${config.packageManager}] globally, or run '${fallbackCmd}' inside the folder later.\n`));
      
      ui.printSummary(config, false);
    } else {
      ui.succeedSpinner('Workspace blueprint compiled cleanly.');
      
      // Trigger native console streams displaying dependency resolution progress
      await installDependencies(targetWorkspace, config.packageManager);
      
      // ==========================================
      // NEW SOURCE CONTROL INITIALIZATION HOOK
      // ==========================================
      console.log(pc.cyan('🔄 Initializing Git repository and securing baseline state...'));
      const gitSuccess = await initGitRepository(targetWorkspace);
      
      if (gitSuccess) {
        console.log(pc.green('✔ Source control tracking initialized cleanly with initial commit.'));
      } else {
        console.log(pc.gray('○ Source control setup bypassed (Git binary absent or unconfigured locally).'));
      }

      // Display polished onboarding summaries
      ui.printSummary(config, true);
    }
  } catch (error) {
    ui.failSpinner('Critical failure encountered during workspace generation.');
    throw error;
  }
};

/**
 * Generates an optimized, project-tailored package.json manifest.
 */
export const composePackageManifest = async (targetWorkspace: string, config: ScaffoldingConfig): Promise<void> => {
  const isESM = config.moduleResolution === 'NodeNext';
  const isTS = config.language === 'typescript';

  const manifest: Record<string, any> = {
    name: config.projectName,
    version: '1.0.0',
    private: true,
    description: 'Enterprise backend service scaffolded via Master Playbook',
    // Inject native module resolution properties conditionally
    ...(isESM && { type: 'module' }),
    scripts: {
      start: isTS ? 'node dist/server.js' : 'node src/server.js',
      dev: isTS ? 'tsx watch src/server.ts' : 'node --watch src/server.js',
      ...(isTS && config.preset !== 'minimal' && {
        build: 'tsc',
        test: 'jest',
        'test:coverage': 'jest --coverage',
      }),
    },
    dependencies: {
      express: '^4.21.0',
      cors: '^2.8.5',
      helmet: '^8.0.0',
    } as Record<string, string>,
    devDependencies: {} as Record<string, string>,
  };

  // ==========================================
  // RESOLVE CORE DEPENDENCY TREE
  // ==========================================
  if (isTS) {
    manifest.devDependencies = {
      ...manifest.devDependencies,
      typescript: '^5.6.2',
      tsx: '^4.19.1',
      '@types/node': '^22.5.5',
      '@types/express': '^4.17.21',
      '@types/cors': '^2.8.17',
      ...(config.preset !== 'minimal' && {
        jest: '^29.7.0',
        'ts-jest': '^29.2.5',
        supertest: '^7.0.0',
        '@types/jest': '^29.5.13',
        '@types/supertest': '^6.0.2',
      }),
    };

    // Advanced Production/Enterprise Presets require heavy utility suites
    if (config.preset !== 'minimal') {
      manifest.scripts.build = 'tsc';
      manifest.dependencies = {
        ...manifest.dependencies,
        pino: '^9.4.0',
        'pino-http': '^10.3.0',
        joi: '^17.13.3', // Standard default validation engine
      };
      manifest.devDependencies['pino-pretty'] = '^11.2.2';
    }
  }

  // Write compiled JSON stream cleanly to disk
  const manifestPath = path.join(targetWorkspace, 'package.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
};

/**
 * Injects isolated architectural plugins (like DB stubs and DTO adapters)
 * directly into the target workspace base.
 */
export const injectArchitecturalAdapters = async (targetWorkspace: string, config: ScaffoldingConfig): Promise<void> => {
  // Skip injection logic entirely for raw JavaScript prototyping builds
  if (config.language === 'javascript' || config.preset === 'minimal') return;

  const pluginsDir = path.join(TEMPLATES_DIR, 'plugins');
  const targetMiddlewares = path.join(targetWorkspace, 'src/middlewares');

  // Inject Joi validation interceptor brick
  await fs.mkdir(targetMiddlewares, { recursive: true });
  const validationStubSrc = path.join(pluginsDir, 'validation-joi/validate.middleware.ts');
  const validationStubDest = path.join(targetMiddlewares, 'validate.middleware.ts');
  
  // Verify plugin asset exists before executing copy transfer
  try {
    await fs.access(validationStubSrc);
    await fs.copyFile(validationStubSrc, validationStubDest);
  } catch {
    // Graceful fallback if static plugin folders haven't been physically populated yet
  }
};

const safeCopyPlugin = async (srcPath: string, destPath: string, featureName: string): Promise<void> => {
  try {
    // Check if the source file physically exists
    await fs.access(srcPath);
    await fs.copyFile(srcPath, destPath);
  } catch (error) {
    // If it fails, throw a loud, descriptive error instead of failing silently
    throw new Error(`Missing template asset for [${featureName}]: Expected file at ${srcPath}`);
  }
};

/**
 * Resolves modular database infrastructure universally across all presets,
 * injecting connection profiles and runtime execution hooks natively.
 */
export const stitchDatabaseAdapter = async (targetWorkspace: string, config: ScaffoldingConfig): Promise<void> => {
  // Determine framework target context
  const isJS = config.language === 'javascript';
  const ext = isJS ? 'js' : 'ts';

  // Ensure we have a valid database target assigned
  const dbTarget = config.database || 'mongodb';

  const pluginsDir = path.join(TEMPLATES_DIR, 'plugins');
  const targetConfigDir = path.join(targetWorkspace, 'src/config');
  await fs.mkdir(targetConfigDir, { recursive: true });

  const manifestPath = path.join(targetWorkspace, 'package.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

  // ==========================================
  // 1. ASSET TRANSFER & DEPENDENCIES
  // ==========================================
  if (dbTarget === 'mongodb') {
    await safeCopyPlugin(
      path.join(pluginsDir, `db-mongo/db.${ext}`),
      path.join(targetConfigDir, `db.${ext}`),
      `MongoDB Persistence Adapter (${ext.toUpperCase()})`
    );
    manifest.dependencies.mongoose = '^8.10.0';
  } else if (dbTarget === 'postgres' || dbTarget === 'mysql') {
    await safeCopyPlugin(
      path.join(pluginsDir, 'db-prisma/db.ts'),
      path.join(targetConfigDir, 'db.ts'),
      'Prisma SQL Client Adapter'
    );

    const targetPrismaDir = path.join(targetWorkspace, 'prisma');
    await fs.mkdir(targetPrismaDir, { recursive: true });

    await safeCopyPlugin(
      path.join(pluginsDir, `db-prisma/schema.${dbTarget}.prisma`),
      path.join(targetPrismaDir, 'schema.prisma'),
      `Prisma Schema (${dbTarget})`
    );

    manifest.dependencies['@prisma/client'] = '^6.0.0';
    manifest.devDependencies.prisma = '^6.0.0';
    manifest.scripts.postinstall = 'prisma generate';
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  // ==========================================
  // 2. RUNTIME SERVER INJECTION HOOKS
  // ==========================================
  // Target the specific server entry file based on language choice
  const serverPath = path.join(targetWorkspace, `src/server.${ext}`);
  try {
    let serverContent = await fs.readFile(serverPath, 'utf-8');

    // Inject standard ES Module import mapping
    const importHook = `import { connectDB } from './config/db.js';\n`;
    serverContent = serverContent.replace(/(import app from '\.\/app\.js';)/, `$1\n${importHook.trim()}`);

    // Mount asynchronous execution sequence prior to port binding
    const bootHook = `await connectDB();\n`;

    if (isJS || config.preset === 'minimal') {
      // Minimal bases use direct app.listen blocks
      serverContent = serverContent.replace(/(app\.listen)/, `${bootHook}\n$1`);
    } else {
      // Advanced bases bind cleanly to const server assignments
      serverContent = serverContent.replace(/(const server = app\.listen)/, `${bootHook}\n$1`);
    }

    await fs.writeFile(serverPath, serverContent, 'utf-8');
  } catch {
    // Fallback safety catch if entry files fail string matching
  }
};

/**
 * Selectively injects advanced enterprise features, wires routing mounts into app.ts,
 * and appends runtime dependencies dynamically to package.json.
 */
export const injectAdvancedFeatures = async (targetWorkspace: string, config: ScaffoldingConfig): Promise<void> => {
  if (config.language === 'javascript' || !config.features) return;

  const pluginsDir = path.join(TEMPLATES_DIR, 'plugins');
  const targetConfig = path.join(targetWorkspace, 'src/config');
  const targetServices = path.join(targetWorkspace, 'src/services');
  const targetRoutes = path.join(targetWorkspace, 'src/routes');

  await fs.mkdir(targetConfig, { recursive: true });
  await fs.mkdir(targetServices, { recursive: true });
  await fs.mkdir(targetRoutes, { recursive: true });

  const manifestPath = path.join(targetWorkspace, 'package.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

  let appImports = '';
  let appMounts = '';

  // 0. JWT AUTHENTICATION SUITE
  if (config.features.auth) {
    const targetMiddlewares = path.join(targetWorkspace, 'src/middlewares');
    await fs.mkdir(targetMiddlewares, { recursive: true });

    await safeCopyPlugin(
      path.join(pluginsDir, 'feature-auth/requireAuth.ts'),
      path.join(targetMiddlewares, 'requireAuth.ts'),
      'JWT Interceptor Guard'
    );
    await safeCopyPlugin(
      path.join(pluginsDir, 'feature-auth/auth.service.ts'),
      path.join(targetServices, 'auth.service.ts'),
      'Auth Cryptographic Engine'
    );
    await safeCopyPlugin(
      path.join(pluginsDir, 'feature-auth/auth.routes.ts'),
      path.join(targetRoutes, 'auth.routes.ts'),
      'Identity Routes'
    );

    manifest.dependencies.bcrypt = '^5.1.1';
    manifest.dependencies.jsonwebtoken = '^9.0.2';
    manifest.devDependencies['@types/bcrypt'] = '^5.0.2';
    manifest.devDependencies['@types/jsonwebtoken'] = '^9.0.7';

    appImports += `import authRoutes from './routes/auth.routes.js';\n`;
    appMounts += `app.use('/api/v1/auth', authRoutes);\n`;
  }

  // 1. REDIS CACHING
  if (config.features.redis) {
    await safeCopyPlugin(
      path.join(pluginsDir, 'feature-redis/redis.ts'),
      path.join(targetConfig, 'redis.ts'),
      'Redis Caching'
    );
    manifest.dependencies.ioredis = '^5.4.1';
  }

  // 2. BULLMQ QUEUES
  if (config.features.bullmq) {
    await safeCopyPlugin(
      path.join(pluginsDir, 'feature-bullmq/queue.ts'),
      path.join(targetConfig, 'queue.ts'),
      'BullMQ Queues'
    );
    manifest.dependencies.bullmq = '^5.13.0';
  }

  // 3. AI GATEWAY
  if (config.features.ai) {
    await safeCopyPlugin(
      path.join(pluginsDir, 'feature-ai/ai.service.ts'),
      path.join(targetServices, 'ai.service.ts'),
      'AI Gateway Service'
    );
    await safeCopyPlugin(
      path.join(pluginsDir, 'feature-ai/ai.routes.ts'),
      path.join(targetRoutes, 'ai.routes.ts'),
      'AI Gateway Routes'
    );
    
    manifest.dependencies['@google/genai'] = '^2.1.0';
    appImports += `import aiRoutes from './routes/ai.routes.js';\n`;
    appMounts += `app.use('/api/v1/ai', aiRoutes);\n`;
  }

  // 4. WEBSOCKETS
  if (config.features.sockets) {
    await safeCopyPlugin(
      path.join(pluginsDir, 'feature-sockets/socket.ts'),
      path.join(targetConfig, 'socket.ts'),
      'WebSockets IO'
    );
    manifest.dependencies['socket.io'] = '^4.8.0';
  }

  // 5. SECURE CLOUD STORAGE (S3)
  if (config.features.s3) {
    await safeCopyPlugin(
      path.join(pluginsDir, 'feature-s3/storage.service.ts'),
      path.join(targetServices, 'storage.service.ts'),
      'S3 Secure Storage'
    );
    manifest.dependencies['@aws-sdk/client-s3'] = '^3.654.0';
    manifest.dependencies['@aws-sdk/s3-request-presigner'] = '^3.654.0';
  }

  // 6. n8n AUTOMATION CONNECTOR
  if (config.features.n8n) {
    await safeCopyPlugin(
      path.join(pluginsDir, 'feature-n8n/automation.service.ts'),
      path.join(targetServices, 'automation.service.ts'),
      'n8n Automation Engine'
    );
  }

  // Inject accumulated framework references straight into central Express core
  if (appImports || appMounts) {
    const appPath = path.join(targetWorkspace, 'src/app.ts');
    try {
      let appContent = await fs.readFile(appPath, 'utf-8');
      appContent = appContent.replace(/(import.*AppError.*;)/, `$1\n${appImports.trim()}`);
      appContent = appContent.replace(/(\/\/ DYNAMIC MODULE ROUTE MOUNTS INJECTED HERE)/, `$1\n${appMounts.trim()}`);
      await fs.writeFile(appPath, appContent, 'utf-8');
    } catch {
      // Graceful fallback if base files are unreadable during sticher run
    }
  }

  // ==========================================
  // INJECT INTEGRATED TESTING FRAMEWORKS
  // ==========================================
  // Guarantee verification suites are attached natively for Production and Enterprise tiers
  if (config.preset === 'enterprise' || config.preset === 'production') {
    const targetTestsDir = path.join(targetWorkspace, 'tests');
    await fs.mkdir(targetTestsDir, { recursive: true });

    // Seed root compiler mapping settings
    await safeCopyPlugin(
      path.join(pluginsDir, 'feature-tests/jest.config.ts'),
      path.join(targetWorkspace, 'jest.config.ts'),
      'Jest Base Configuration'
    );

    // Seed native routing integrations verification block
    await safeCopyPlugin(
      path.join(pluginsDir, 'feature-tests/health.test.ts'),
      path.join(targetTestsDir, 'health.test.ts'),
      'API Integration Verification Suite'
    );

    // Conditionally attach unit suite if Identity and Access Control modules are checked
    if (config.features?.auth) {
      await safeCopyPlugin(
        path.join(pluginsDir, 'feature-tests/auth.service.test.ts'),
        path.join(targetTestsDir, 'auth.service.test.ts'),
        'Auth Cryptographic Unit Suite'
      );
    }
  }

  // ==========================================
  // INJECT CI/CD GITHUB ACTIONS PIPELINE
  // ==========================================
  // Strictly enforce CI/CD pipeline structures on Production and Enterprise architectures
  if (config.preset === 'enterprise' || config.preset === 'production') {
    const workflowsDir = path.join(targetWorkspace, '.github/workflows');
    await fs.mkdir(workflowsDir, { recursive: true });

    const ciTemplatePath = path.join(TEMPLATES_DIR, 'plugins/feature-cicd/ci.yml');
    try {
      let ciContent = await fs.readFile(ciTemplatePath, 'utf-8');

      // Resolve package manager targets to match dynamic execution pipelines
      const installCmd = config.packageManager === 'yarn' ? 'yarn' : `${config.packageManager} install`;
      const testCmd = config.packageManager === 'npm' ? 'npm run test' : `${config.packageManager} test`;
      
      // Native actions/setup-node configuration expects npm, pnpm, or yarn strings strictly
      const cacheTarget = config.packageManager === 'bun' ? 'npm' : config.packageManager;

      ciContent = ciContent.replace(/\{\{cacheTarget\}\}/g, cacheTarget);
      ciContent = ciContent.replace(/\{\{installCmd\}\}/g, installCmd);
      ciContent = ciContent.replace(/\{\{testCmd\}\}/g, testCmd);

      await fs.writeFile(path.join(workflowsDir, 'ci.yml'), ciContent, 'utf-8');
    } catch {
      // Catch safety fallbacks cleanly if staging templates are structurally unlinked
    }
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
};
/**
 * Compiles a perfectly tailored environment file containing strictly the keys
 * mandated by the active database and enterprise module choices.
 */
export const composeEnvironmentVariables = async (targetWorkspace: string, config: ScaffoldingConfig): Promise<void> => {
  let envStream = `# Generated by Master Playbook Blueprint\n`;
  envStream += `NODE_ENV=development\n`;
  envStream += `PORT=${config.port}\n\n`;

  // Database Connection Strings
  envStream += `# Database Persistence Layer\n`;
  if (config.database === 'mongodb') {
    envStream += `DATABASE_URL=mongodb://localhost:27017/${config.projectName}\n`;
  } else if (config.database === 'postgres') {
    envStream += `DATABASE_URL="postgresql://postgres:password@localhost:5432/${config.projectName}?schema=public"\n`;
  } else if (config.database === 'mysql') {
    envStream += `DATABASE_URL="mysql://root:password@localhost:3306/${config.projectName}"\n`;
  }
  envStream += '\n';

  // Advanced Enterprise Modules
  if ((config.preset === 'enterprise' || config.preset === 'production') && config.features) {
    envStream += `# Enterprise Infrastructure Keys\n`;
    
    if (config.features.auth) {
      envStream += `JWT_SECRET=super_secure_production_jwt_signing_key_here\n`;
    }
    if (config.features.redis) {
      envStream += `REDIS_URL=redis://localhost:6379\n`;
    }
    if (config.features.ai) {
      envStream += `GEMINI_API_KEY=your_gemini_api_key_here\n`;
    }
    if (config.features.s3) {
      envStream += `STORAGE_REGION=us-east-1\n`;
      envStream += `STORAGE_BUCKET_NAME=my-production-bucket\n`;
      envStream += `STORAGE_ACCESS_KEY=your_access_key_id\n`;
      envStream += `STORAGE_SECRET_KEY=your_secret_access_key\n`;
    }
    if (config.features.n8n) {
      envStream += `N8N_WEBHOOK_BASE_URL=http://localhost:5678\n`;
      envStream += `N8N_SHARED_SECRET=super_secure_orchestration_secret\n`;
    }
  }

  // Safely output both environment definitions directly into project root
  await fs.writeFile(path.join(targetWorkspace, '.env'), envStream.trim() + '\n', 'utf-8');
  await fs.writeFile(path.join(targetWorkspace, '.env.example'), envStream.trim() + '\n', 'utf-8');
};

/**
 * Generates an onboarding guide dynamically tailored to the user's selected framework parameters.
 */
export const composeInstructionalReadme = async (targetWorkspace: string, config: ScaffoldingConfig): Promise<void> => {
  const isTS = config.language === 'typescript';
  const ext = isTS ? 'ts' : 'js';

  let readme = `# 🚀 ${config.projectName}\n\n`;
  readme += `Welcome to your highly scalable, enterprise-grade backend infrastructure. This application has been explicitly tailored to your framework requirements using the **Master Playbook Blueprint architecture**.\n\n`;

  readme += `## 📁 Layered Anatomy Tutorial\n\n`;
  readme += `To ensure clean separation of concerns and maximum maintainability, this project enforces strict directory boundaries. Navigate your newly scaffolded layers as follows:\n\n`;

  readme += `* **\`src/config/\`**: Houses external resource configurations, database drivers, and global environment state variables.\n`;
  readme += `* **\`src/controllers/\`**: Acts as your networking gateways. Controllers parse incoming HTTP requests, delegate validation, and pass parameters directly down to internal core services.\n`;
  readme += `* **\`src/middlewares/\`**: Contains centralized request interceptors, schema validation blocks, and secure operational authorization gates.\n`;
  readme += `* **\`src/routes/\`**: Maps clear network access routes directly to individual controller logic targets.\n`;
  readme += `* **\`src/services/\`**: Contains pure business logic execution engines and third-party orchestration commands. Keep framework network parameters entirely decoupled from this level.\n\n`;

  readme += `## ⚡ Quickstart Execution\n\n`;
  readme += `1. Duplicate the environment template and verify connection keys:\n`;
  readme += `   \`\`\`bash\n   cp .env.example .env\n   \`\`\`\n`;
  readme += `2. Boot the live-reloading development server:\n`;
  readme += `   \`\`\`bash\n   ${config.packageManager === 'npm' ? 'npm run dev' : `${config.packageManager} dev`}\n   \`\`\`\n`;
  readme += `3. Verify framework operation by querying the root verification loop:\n`;
  readme += `   \`\`\`bash\n   curl http://localhost:${config.port}/health\n   \`\`\`\n\n`;

  if (config.preset === 'enterprise' && config.features) {
    readme += `## ⚙️ Injected Enterprise Modules\n\n`;
    readme += `Your workspace has been successfully pre-configured with the following active architectural integrations:\n\n`;
    if (config.features.redis) readme += `* **High-Performance Caching**: Fully configured \`ioredis\` connection mapped natively inside \`src/config/redis.${ext}\`.\n`;
    if (config.features.bullmq) readme += `* **Asynchronous Jobs**: Background queue structures and worker templates initialized natively inside \`src/config/queue.${ext}\`.\n`;
    if (config.features.ai) readme += `* **Dynamic AI Gateway**: Dedicated operational generation services injected straight into \`src/services/ai.service.${ext}\` with route hooks mounted natively to \`/api/v1/ai\`.\n`;
  }

  readme += `\n---\n*Engineered for velocity, stability, and unyielding scale.*`;

  await fs.writeFile(path.join(targetWorkspace, 'README.md'), readme, 'utf-8');
};