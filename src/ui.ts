import ora, { Ora } from 'ora';
import pc from 'picocolors';
import { ScaffoldingConfig } from './prompts.js';

let spinner: Ora | null = null;

export const ui = {
  startSpinner(text: string): void {
    spinner = ora({
      text: pc.cyan(text),
      spinner: 'dots',
    }).start();
  },

  updateSpinner(text: string): void {
    if (spinner) {
      spinner.text = pc.cyan(text);
    }
  },

  succeedSpinner(text: string): void {
    if (spinner) {
      spinner.succeed(pc.green(text));
      spinner = null;
    }
  },

  failSpinner(text: string): void {
    if (spinner) {
      spinner.fail(pc.red(text));
      spinner = null;
    }
  },

  /**
   * Prints optimized, highly tailored instructions directly to the developer console.
   */
  printSummary(config: ScaffoldingConfig, dependenciesInstalled: boolean = true): void {
    // Dynamically resolve framework execution targets
    const devCmd = config.packageManager === 'npm' ? 'npm run dev' : `${config.packageManager} dev`;
    const installCmd = config.packageManager === 'yarn' ? 'yarn' : `${config.packageManager} install`;

    // Evaluate if the active stack configuration relies on environment variables
    const needsEnv = config.database || (config.preset === 'enterprise' && config.features && Object.values(config.features).some(Boolean));

    console.log('\n' + pc.bold(pc.green(`🎉 Successfully scaffolded ${pc.cyan(config.projectName)}!`)));
    console.log(pc.gray('==================================================================='));
    console.log(pc.bold('👉 Next Steps:'));
    console.log(`   ${pc.cyan(`cd ${config.projectName}`)}`);

    // Strictly display manual package pull instructions ONLY if automated setup was bypassed
    if (!dependenciesInstalled) {
      console.log(`   ${pc.cyan(installCmd)}        ${pc.gray('# (Dependencies were not installed automatically)')}`);
    }

    console.log(`   ${pc.cyan(devCmd)}            ${pc.gray('# (Start the hot-reloading development server)')}`);

    // Contextual hint renders strictly if backing resources or API keys are required
    if (needsEnv) {
      console.log('');
      console.log(`   ${pc.yellow('💡 Tip: Your .env file is already created! Open it to fill in')}`);
      console.log(`   ${pc.yellow('        your active database connection strings or module API keys.')}`);
    }

    console.log(pc.gray('===================================================================\n'));
  },
};