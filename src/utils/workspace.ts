import fs from 'fs/promises';
import path from 'path';

export interface WorkspaceContext {
  isTS: boolean;
  ext: 'ts' | 'js';
  srcDir: string;
  rootDir: string;
}

/**
 * Scans the current working directory to detect language targeting (TS vs JS)
 * and resolves the absolute paths for code generation drops.
 */
export const scanWorkspace = async (): Promise<WorkspaceContext> => {
  const cwd = process.env.INIT_CWD || process.cwd();
  let isTS = false;

  try {
    // If tsconfig.json exists in the project root, we target TypeScript compilation
    await fs.access(path.join(cwd, 'tsconfig.json'));
    isTS = true;
  } catch {
    isTS = false;
  }

  // Resolve target source root (defaulting to clean src/ layout)
  const potentialSrc = path.join(cwd, 'src');
  let srcDir = cwd;

  try {
    await fs.access(potentialSrc);
    srcDir = potentialSrc;
  } catch {
    // Fallback strictly if the developer opted out of nested source folders
    srcDir = cwd;
  }

  return {
    isTS,
    ext: isTS ? 'ts' : 'js',
    srcDir,
    rootDir: cwd,
  };
};

/**
 * Helper utility to securely verify if a destination file already exists.
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};