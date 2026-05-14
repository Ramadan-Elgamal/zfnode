import { exec, spawn } from 'child_process';
import util from 'util';
import pc from 'picocolors';

// Promisify native child_process execution for clean async/await flows
const execAsync = util.promisify(exec);

/**
 * Silently queries the host operating system's PATH to verify if the chosen
 * package manager executable is physically installed and responding.
 */
export const verifyPackageManager = async (packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun'): Promise<boolean> => {
  try {
    await execAsync(`${packageManager} --version`);
    return true;
  } catch {
    return false;
  }
};

/**
 * Spawns an asynchronous package manager installation process inside the
 * generated workspace root directory.
 */
export const installDependencies = (targetWorkspace: string, packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun'): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('');
    console.log(pc.cyan(`📦 Installing dependencies using ${pc.bold(packageManager)}...`));

    // Determine clean execution arguments based on chosen client
    const args = packageManager === 'yarn' ? [] : ['install'];

    const child = spawn(packageManager, args, {
      cwd: targetWorkspace,
      stdio: 'inherit', // Pipes native installation streams and logs straight to standard output
      shell: true,      // Ensures cross-platform execution stability on Windows systems
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Package manager execution failed with exit code: ${code}`));
        return;
      }
      resolve();
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
};

/**
 * Silently initializes a local Git repository, stages all generated skeleton files,
 * and attempts to lock down a pristine initial baseline commit.
 */
export const initGitRepository = async (targetWorkspace: string): Promise<boolean> => {
  try {
    // Ensure the host platform natively possesses an operational Git execution path
    await execAsync('git --version');

    // Initialize local source tracking context
    await execAsync('git init', { cwd: targetWorkspace });

    // Stage all scaffolded infrastructure files cleanly
    await execAsync('git add .', { cwd: targetWorkspace });

    // Commit baseline state securely
    await execAsync('git commit -m "chore: initial full-stack scaffold via create-node-blueprint"', { 
      cwd: targetWorkspace 
    });

    return true;
  } catch {
    // Fails smoothly if global git config identities are absent on the host OS
    return false;
  }
};