import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pc from 'picocolors';
import { ScaffoldingConfig } from './prompts.js';
import { installDependencies } from './installer.js';
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
    if (config.language === 'typescript' && config.preset !== 'minimal') {
      ui.updateSpinner('Stitching modular persistence layers and database profiles...');
      const pluginsDir = path.join(TEMPLATES_DIR, 'plugins');
      const targetConfigDir = path.join(targetWorkspace, 'src/config');
      await fs.mkdir(targetConfigDir, { recursive: true });

      let dbStubSrc = '';
      if (config.database === 'mongodb') {
        dbStubSrc = path.join(pluginsDir, 'db-mongo/db.ts');
      } else if (config.database === 'postgres' || config.database === 'mysql') {
        dbStubSrc = path.join(pluginsDir, 'db-prisma/db.ts');
        const schemaSrc = path.join(pluginsDir, `db-prisma/schema.${config.database}.prisma`);
        const schemaDest = path.join(targetWorkspace, 'prisma/schema.prisma');
        await fs.mkdir(path.dirname(schemaDest), { recursive: true });
        await fs.copyFile(schemaSrc, schemaDest).catch(() => {});
      }

      if (dbStubSrc) {
        await fs.copyFile(dbStubSrc, path.join(targetConfigDir, 'db.ts')).catch(() => {});
      }
    }

    // 5. Selectively Inject Advanced Features
    ui.updateSpinner('Injecting isolated enterprise modules and routing stubs...');
    await injectAdvancedFeatures(targetWorkspace, config);

    // 6. Generate Contextual Environment Files
    await composeEnvironmentVariables(targetWorkspace, config);

    ui.succeedSpinner('Workspace blueprint compiled cleanly.');

    // 7. Execute Background Dependency Installation
    // The installer spawns its own logs, so we let it render natively
    await installDependencies(targetWorkspace, config.packageManager);

    // Print final polished summary block
    ui.printSummary(config);
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
      start: isTS ? 'node dist/server.js' : 'node server.js',
      dev: isTS ? 'tsx watch src/server.ts' : 'node --watch server.js',
    },
    dependencies: {
      express: '^4.21.0',
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

  // ==========================================
  // RESOLVE MODULAR DATABASE DRIVERS
  // ==========================================
  if (config.database === 'mongodb') {
    manifest.dependencies.mongoose = '^8.6.3';
  } else if (config.database === 'postgres' || config.database === 'mysql') {
    manifest.dependencies['@prisma/client'] = '^5.19.1';
    manifest.devDependencies.prisma = '^5.19.1';
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

/**
 * Selectively injects advanced enterprise features and appends their dependencies
 * dynamically to the target workspace package.json manifest.
 */
export const injectAdvancedFeatures = async (targetWorkspace: string, config: ScaffoldingConfig): Promise<void> => {
  if (config.language === 'javascript' || config.preset !== 'enterprise' || !config.features) return;

  const pluginsDir = path.join(TEMPLATES_DIR, 'plugins');
  const targetConfig = path.join(targetWorkspace, 'src/config');
  const targetServices = path.join(targetWorkspace, 'src/services');

  await fs.mkdir(targetConfig, { recursive: true });
  await fs.mkdir(targetServices, { recursive: true });

  // Read existing package.json to append feature dependencies dynamically
  const manifestPath = path.join(targetWorkspace, 'package.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

  // 1. REDIS CACHING
  if (config.features.redis) {
    const src = path.join(pluginsDir, 'feature-redis/redis.ts');
    await fs.copyFile(src, path.join(targetConfig, 'redis.ts')).catch(() => {});
    manifest.dependencies.ioredis = '^5.4.1';
  }

  // 2. BULLMQ QUEUES
  if (config.features.bullmq) {
    const src = path.join(pluginsDir, 'feature-bullmq/queue.ts');
    await fs.copyFile(src, path.join(targetConfig, 'queue.ts')).catch(() => {});
    manifest.dependencies.bullmq = '^5.13.0';
  }

  // 3. AI GATEWAY
  if (config.features.ai) {
    const src = path.join(pluginsDir, 'feature-ai/ai.service.ts');
    await fs.copyFile(src, path.join(targetServices, 'ai.service.ts')).catch(() => {});
    manifest.dependencies['@google/genai'] = '^0.1.1';
  }

  // 4. WEBSOCKETS
  if (config.features.sockets) {
    manifest.dependencies['socket.io'] = '^4.8.0';
  }

  // 5. SECURE CLOUD STORAGE (S3)
  if (config.features.s3) {
    manifest.dependencies['@aws-sdk/client-s3'] = '^3.654.0';
    manifest.dependencies['@aws-sdk/s3-request-presigner'] = '^3.654.0';
  }

  // Save compiled dependencies back to disk
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
  if (config.preset === 'enterprise' && config.features) {
    envStream += `# Enterprise Infrastructure Keys\n`;
    
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