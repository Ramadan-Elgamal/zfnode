import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates');

/**
 * Standard entity name representations computed dynamically from raw console input.
 */
export interface EntityNames {
  raw: string;
  pascalName: string; // e.g., ProductOrder
  camelName: string;  // e.g., productOrder
  kebabName: string;  // e.g., product-order
}

/**
 * Converts any input string (camelCase, PascalCase, kebab-case, snake_case)
 * into a structured dictionary of uniform target variations.
 */
export const parseEntityName = (input: string): EntityNames => {
  // Strip common suffixes if accidentally typed by the user (e.g., 'UserController' -> 'User')
  const cleanInput = input
    .replace(/(Controller|Service|Routes|Route)$/i, '')
    .trim();

  // Split string into separate word tokens based on case transitions, hyphens, or underscores
  const words = cleanInput
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[\s-_]+/g, ' ')
    .split(' ')
    .filter(Boolean);

  // Compute PascalCase (e.g., 'user order' -> 'UserOrder')
  const pascalName = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');

  // Compute camelCase (e.g., 'UserOrder' -> 'userOrder')
  const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);

  // Compute kebab-case (e.g., 'UserOrder' -> 'user-order')
  const kebabName = words.map((w) => w.toLowerCase()).join('-');

  return {
    raw: input,
    pascalName,
    camelName,
    kebabName,
  };
};

/**
 * Reads a targeted template stub from disk, injects computed casing properties,
 * and handles dynamic JS/TS syntax compilation stripping.
 */
export const hydrateStub = async (stubFileName: string, names: EntityNames, isTS: boolean): Promise<string> => {
  const stubPath = path.join(TEMPLATES_DIR, `stubs/${stubFileName}.stub`);
  
  try {
    let content = await fs.readFile(stubPath, 'utf-8');

    // Perform highly specific injection mapping loops across all placeholders
    content = content.replace(/\{\{pascalName\}\}/g, names.pascalName);
    content = content.replace(/\{\{PascalName\}\}/g, names.pascalName);
    content = content.replace(/\{\{camelName\}\}/g, names.camelName);
    content = content.replace(/\{\{kebabName\}\}/g, names.kebabName);

    // If generating for pure JavaScript outputs, cleanly strip strict TypeScript syntax
    if (!isTS) {
      // Strip static imports referencing external Express TS interfaces
      content = content.replace(/import \{ Router, Request, Response, NextFunction \} from 'express';\n?/g, "import { Router } from 'express';\n");
      content = content.replace(/import \{.*Request,.*Response,.*NextFunction.*\} from 'express';\n?/g, '');
      // Strip inline type annotations from Express function request headers
      content = content.replace(/\(req: Request, res: Response, next: NextFunction\)/g, '(req, res, next)');
      content = content.replace(/\(payload: Record<string, any>\)/g, '(payload)');
      content = content.replace(/\(id: string, payload: Record<string, any>\)/g, '(id, payload)');
      content = content.replace(/\(id: string\)/g, '(id)');
    }

    return content;
  } catch (error) {
    throw new Error(`🚨 Failed to locate source stub file: [${stubFileName}.stub]`);
  }
};