/**
 * Fails (exit 1) when an admin page, layout or API route does not call the
 * admin guard first.
 *
 * Usage: npm run admin:check-guards   (also part of `npm test`)
 *
 * Rules, checked on the TypeScript AST (not text search):
 * - Every `route.ts` under src/app/api/admin and src/app/admin exports its
 *   HTTP handlers as `export async function GET|POST|…`. Each handler's first
 *   statement is `const x = await guardAdmin(request, { mutation: <bool> })`
 *   (or `await requireAdminApi()`), and the second is
 *   `if (x instanceof Response) return x;`. POST, PUT, PATCH and DELETE must
 *   pass `mutation: true`, so the Origin check runs.
 * - Every `page.tsx`, `layout.tsx`, `template.tsx` and `default.tsx` under
 *   src/app/admin has a default-exported async function whose first statement
 *   awaits `requireAdminPage()`, except the files in PUBLIC_FILES.
 * - No `'use server'` file or inline server action under the admin folders.
 *
 * Runs with plain Node (type stripping), so only erasable TypeScript is used.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import ts from 'typescript';

const ROOT = process.argv[2] ?? process.cwd();
const SCAN_DIRS = ['src/app/admin', 'src/app/api/admin'];
const HTTP_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']);
const MUTATIONS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const PAGE_FILES = new Set(['page.tsx', 'layout.tsx', 'template.tsx', 'default.tsx']);

/** Files that are deliberately not guarded, and why. Each must exist. */
const PUBLIC_FILES: Record<string, string> = {
  'src/app/admin/layout.tsx': 'Root admin layout: metadata only, renders children. It also wraps /admin/login.',
  'src/app/admin/login/page.tsx': 'The sign-in page itself. It reads the session only to redirect a signed-in admin.',
};

function walk(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function toPosix(path: string): string {
  return relative(ROOT, path).split(sep).join('/');
}

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === kind);
}

/** `await fn(...)` → the call, when the callee is the identifier `fn`. */
function awaitedCall(expression: ts.Expression | undefined, names: readonly string[]): ts.CallExpression | null {
  if (!expression || !ts.isAwaitExpression(expression)) return null;
  const call = expression.expression;
  if (!ts.isCallExpression(call) || !ts.isIdentifier(call.expression)) return null;
  return names.includes(call.expression.text) ? call : null;
}

/** Value of `{ mutation: true|false }` in guardAdmin's second argument. */
function mutationFlag(call: ts.CallExpression): boolean | null {
  const options = call.arguments[1];
  if (!options || !ts.isObjectLiteralExpression(options)) return null;
  for (const property of options.properties) {
    if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) && property.name.text === 'mutation') {
      if (property.initializer.kind === ts.SyntaxKind.TrueKeyword) return true;
      if (property.initializer.kind === ts.SyntaxKind.FalseKeyword) return false;
    }
  }
  return null;
}

/** `if (x instanceof Response) return x;` */
function isEarlyReturn(statement: ts.Statement | undefined, variable: string): boolean {
  if (!statement || !ts.isIfStatement(statement)) return false;
  const test = statement.expression;
  if (
    !ts.isBinaryExpression(test) ||
    test.operatorToken.kind !== ts.SyntaxKind.InstanceOfKeyword ||
    !ts.isIdentifier(test.left) ||
    test.left.text !== variable ||
    !ts.isIdentifier(test.right) ||
    test.right.text !== 'Response'
  ) {
    return false;
  }
  let then = statement.thenStatement;
  if (ts.isBlock(then) && then.statements.length === 1 && then.statements[0]) then = then.statements[0];
  return ts.isReturnStatement(then) && !!then.expression && ts.isIdentifier(then.expression) && then.expression.text === variable;
}

function checkHandler(name: string, fn: ts.FunctionDeclaration): string | null {
  const [first, second] = fn.body?.statements ?? [];
  if (!first || !ts.isVariableStatement(first) || first.declarationList.declarations.length !== 1) {
    return `${name}: the first statement must be \`const auth = await guardAdmin(request, { mutation })\`.`;
  }
  const declaration = first.declarationList.declarations[0];
  if (!declaration || !ts.isIdentifier(declaration.name)) return `${name}: the guard result must be a named const.`;
  const call = awaitedCall(declaration.initializer, ['guardAdmin', 'requireAdminApi']);
  if (!call) return `${name}: the first statement must await guardAdmin() or requireAdminApi().`;
  if (!isEarlyReturn(second, declaration.name.text)) {
    return `${name}: the second statement must be \`if (${declaration.name.text} instanceof Response) return ${declaration.name.text};\`.`;
  }
  const callee = (call.expression as ts.Identifier).text;
  if (MUTATIONS.has(name)) {
    if (callee !== 'guardAdmin' || mutationFlag(call) !== true) {
      return `${name}: a mutation must call guardAdmin(request, { mutation: true }) so the Origin header is checked.`;
    }
  } else if (callee === 'guardAdmin' && mutationFlag(call) === null) {
    return `${name}: pass { mutation: true|false } to guardAdmin.`;
  }
  return null;
}

function checkRoute(source: ts.SourceFile): { errors: string[]; handlers: string[] } {
  const errors: string[] = [];
  const handlers: string[] = [];
  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement) && hasModifier(statement, ts.SyntaxKind.ExportKeyword) && statement.name) {
      const name = statement.name.text;
      if (!HTTP_METHODS.has(name)) continue;
      handlers.push(name);
      const error = checkHandler(name, statement);
      if (error) errors.push(error);
    } else if (ts.isVariableStatement(statement) && hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && HTTP_METHODS.has(declaration.name.text)) {
          errors.push(`${declaration.name.text}: export handlers as \`export async function\` so the guard can be checked.`);
        }
      }
    } else if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) {
        if (HTTP_METHODS.has(element.name.text)) {
          errors.push(`${element.name.text}: re-exported handlers cannot be checked; use \`export async function\`.`);
        }
      }
    }
  }
  if (handlers.length === 0 && errors.length === 0) errors.push('no HTTP handler found.');
  return { errors, handlers };
}

function defaultExportFunction(source: ts.SourceFile): ts.FunctionDeclaration | null {
  for (const statement of source.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      hasModifier(statement, ts.SyntaxKind.ExportKeyword) &&
      hasModifier(statement, ts.SyntaxKind.DefaultKeyword)
    ) {
      return statement;
    }
  }
  return null;
}

function checkPage(source: ts.SourceFile): string[] {
  const fn = defaultExportFunction(source);
  if (!fn) return ['the default export must be a function declaration.'];
  if (!hasModifier(fn, ts.SyntaxKind.AsyncKeyword)) return ['the default export must be async and await requireAdminPage().'];
  const first = fn.body?.statements[0];
  let expression: ts.Expression | undefined;
  if (first && ts.isExpressionStatement(first)) expression = first.expression;
  else if (first && ts.isVariableStatement(first)) expression = first.declarationList.declarations[0]?.initializer;
  return awaitedCall(expression, ['requireAdminPage']) ? [] : ['the first statement must await requireAdminPage().'];
}

/** 'use server' directives at file level or inside any function. */
function hasServerAction(source: ts.SourceFile): boolean {
  let found = false;
  const visit = (node: ts.Node): void => {
    if (found) return;
    if (ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression) && node.expression.text === 'use server') {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

const failures: string[] = [];
const report: string[] = [];
const seen = new Set<string>();

for (const dir of SCAN_DIRS) {
  for (const path of walk(join(ROOT, dir))) {
    const file = toPosix(path);
    const base = file.slice(file.lastIndexOf('/') + 1);
    if (!/\.(ts|tsx)$/.test(base)) continue;
    const source = ts.createSourceFile(file, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, base.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    seen.add(file);

    if (hasServerAction(source)) failures.push(`${file}: server actions are not allowed in the admin area (use a guarded /api/admin route).`);

    if (base === 'route.ts') {
      const { errors, handlers } = checkRoute(source);
      errors.forEach((error) => failures.push(`${file}: ${error}`));
      if (errors.length === 0) report.push(`ok    ${file}  [${handlers.join(', ')}]`);
    } else if (PAGE_FILES.has(base)) {
      if (file in PUBLIC_FILES) {
        report.push(`public ${file}  (${PUBLIC_FILES[file]})`);
        continue;
      }
      const errors = checkPage(source);
      errors.forEach((error) => failures.push(`${file}: ${error}`));
      if (errors.length === 0) report.push(`ok    ${file}  [requireAdminPage]`);
    }
  }
}

for (const file of Object.keys(PUBLIC_FILES)) {
  if (!seen.has(file)) failures.push(`${file}: listed in PUBLIC_FILES but missing; remove it from the list.`);
}

console.log(report.join('\n'));
if (failures.length > 0) {
  console.error(`\nAdmin guard check FAILED (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(`\nAdmin guard check passed: ${report.length} files.`);
