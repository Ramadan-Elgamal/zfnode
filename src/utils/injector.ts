import fs from 'fs/promises';
import path from 'path';
import { EntityNames } from './stub.js';
import { WorkspaceContext } from './workspace.js';

/**
 * Intelligently scans the primary Express application file, appends the new router import,
 * and injects the route mounting middleware securely below core application parsers.
 */
export const injectRouteIntoApp = async (context: WorkspaceContext, names: EntityNames): Promise<boolean> => {
  const appPath = path.join(context.srcDir, `app.${context.ext}`);
  
  try {
    // Verify application entry point exists before attempting transformations
    await fs.access(appPath);
    let content = await fs.readFile(appPath, 'utf-8');

    const importStatement = `import ${names.camelName}Routes from './routes/${names.kebabName}.routes.js';`;
    const mountStatement = `app.use('/api/v1/${names.kebabName}s', ${names.camelName}Routes);`;

    // Protect against duplicate bindings if the route is already present
    if (content.includes(importStatement) || content.includes(mountStatement)) {
      return false;
    }

    // ==========================================
    // 1. SAFE IMPORT STATEMENT INJECTION
    // ==========================================
    // Locate the final static import mapping to append our domain router cleanly below it
    const importRegex = /(import .* from '.*';\n?)/g;
    let match;
    let lastImportIndex = -1;
    
    while ((match = importRegex.exec(content)) !== null) {
      lastImportIndex = match.index + match[0].length;
    }

    if (lastImportIndex !== -1) {
      content = content.slice(0, lastImportIndex) + `${importStatement}\n` + content.slice(lastImportIndex);
    } else {
      // Fallback: prepend directly to the absolute top of the source buffer
      content = `${importStatement}\n` + content;
    }

    // ==========================================
    // 2. SAFE MIDDLEWARE MOUNT INJECTION
    // ==========================================
    // Target standard JSON body parsers as a highly reliable insertion anchor
    const jsonAnchor = /(app\.use\(express\.json\(\)\);\n?)/;
    
    if (jsonAnchor.test(content)) {
      content = content.replace(jsonAnchor, `$1${mountStatement}\n`);
    } else {
      // Fallback anchor: mount safely above the default application module export
      const exportAnchor = /(export default app;)/;
      if (exportAnchor.test(content)) {
        content = content.replace(exportAnchor, `${mountStatement}\n\n$1`);
      } else {
        // Final fallback: append directly to the end of the file contents
        content += `\n${mountStatement}\n`;
      }
    }

    await fs.writeFile(appPath, content, 'utf-8');
    return true;
  } catch (error) {
    // Return false cleanly if target buffers are locked or non-existent
    return false;
  }
};