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

  printSummary(config: ScaffoldingConfig): void {
    const isJS = config.language === 'javascript';
    const devCmd = isJS ? 'npm run dev' : config.packageManager === 'npm' ? 'npm run dev' : `${config.packageManager} dev`;

    console.log('\n' + pc.bold(pc.green(`🎉 Successfully scaffolded ${pc.cyan(config.projectName)}!`)));
    console.log(pc.gray('==================================================================='));
    console.log(pc.bold('👉 Next Steps:'));
    console.log(`   ${pc.cyan(`cd ${config.projectName}`)}`);
    console.log(`   ${pc.cyan('cp .env.example .env')}   ${pc.gray('# (Ensure you populate active resource credentials)')}`);
    console.log(`   ${pc.cyan(devCmd)}            ${pc.gray('# (Start the hot-reloading development server)')}`);
    console.log(pc.gray('===================================================================\n'));
  },
};