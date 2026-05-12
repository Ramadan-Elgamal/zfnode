import { spawn } from 'child_process';
import pc from 'picocolors';

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