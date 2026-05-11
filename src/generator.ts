import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pc from 'picocolors';
import { ScaffoldingConfig } from './prompts.js';

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
  console.log(pc.cyan(`🚀 Scaffolding workspace inside: ${pc.bold(targetWorkspace)}`));

  try {
    await fs.mkdir(targetWorkspace, { recursive: true });

    // 1. Scaffold Core Preset Base
    const presetFolder = config.language === 'javascript' 
      ? 'presets/minimal-js' 
      : `presets/${config.preset === 'minimal' ? 'minimal-ts' : 'advanced-ts'}`;
      
    const presetSrc = path.join(TEMPLATES_DIR, presetFolder);
    await copyTemplateDir(presetSrc, targetWorkspace, config);

    // 2. Compose Dynamic Dependency Tree
    await composePackageManifest(targetWorkspace, config);

    // 3. Inject DTO Validation Layers
    await injectArchitecturalAdapters(targetWorkspace, config);

    // 4. Stitch Modular Database Connectors
    if (config.language === 'typescript' && config.preset !== 'minimal') {
      const pluginsDir = path.join(TEMPLATES_DIR, 'plugins');
      const targetConfigDir = path.join(targetWorkspace, 'src/config');
      await fs.mkdir(targetConfigDir, { recursive: true });

      let dbStubSrc = '';
      if (config.database === 'mongodb') {
        dbStubSrc = path.join(pluginsDir, 'db-mongo/db.ts');
      } else if (config.database === 'postgres' || config.database === 'mysql') {
        dbStubSrc = path.join(pluginsDir, 'db-prisma/db.ts');
        // Drop Prisma schema definitions directly into project root directory
        const schemaSrc = path.join(pluginsDir, `db-prisma/schema.${config.database}.prisma`);
        const schemaDest = path.join(targetWorkspace, 'prisma/schema.prisma');
        await fs.mkdir(path.dirname(schemaDest), { recursive: true });
        await fs.copyFile(schemaSrc, schemaDest).catch(() => {});
      }

      if (dbStubSrc) {
        await fs.copyFile(dbStubSrc, path.join(targetConfigDir, 'db.ts')).catch(() => {});
      }
    }

    console.log(pc.green('✔ Base architecture and database layers successfully bound.'));
  } catch (error) {
    console.error(pc.red('❌ Scaffolding engine failed to execute pipeline updates.'));
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