/**
 * Prints ADMIN_PASSWORD_HASH_B64=<base64 of a bcrypt cost-12 hash>.
 *
 * Usage: npm run admin:hash
 *
 * The password is read interactively with echo off. It is never accepted as
 * a command-line argument, so it is not saved in shell history.
 */
import bcrypt from 'bcryptjs';

const MIN_LENGTH = 14;
const BCRYPT_COST = 12;

function readHidden(prompt: string): Promise<string> {
  const { stdin, stdout } = process;
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    return Promise.reject(
      new Error(
        'This script needs an interactive terminal (PowerShell, Windows Terminal, macOS/Linux terminal). ' +
          'In Git Bash on Windows, run: winpty npm.cmd run admin:hash'
      )
    );
  }

  return new Promise((resolve, reject) => {
    let value = '';
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const finish = (error?: Error) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener('data', onData);
      stdout.write('\n');
      if (error) reject(error);
      else resolve(value);
    };

    function onData(chunk: string) {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') {
          finish();
          return;
        }
        if (char === '\u0003') {
          finish(new Error('Cancelled.'));
          return;
        }
        if (char === '\u007f' || char === '\b') {
          value = Array.from(value).slice(0, -1).join('');
          continue;
        }
        if (char >= ' ') value += char;
      }
    }

    stdin.on('data', onData);
  });
}

async function main(): Promise<void> {
  const password = await readHidden('Admin password: ');

  if (Array.from(password).length < MIN_LENGTH) {
    throw new Error(`The password must be at least ${MIN_LENGTH} characters.`);
  }
  if (bcrypt.truncates(password)) {
    throw new Error('The password is longer than 72 bytes, which bcrypt would truncate. Use a shorter one.');
  }

  const confirmation = await readHidden('Repeat password: ');
  if (confirmation !== password) {
    throw new Error('The passwords do not match.');
  }

  const hash = await bcrypt.hash(password, BCRYPT_COST);
  const encoded = Buffer.from(hash, 'utf8').toString('base64');
  process.stdout.write(`ADMIN_PASSWORD_HASH_B64=${encoded}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'Failed.'}\n`);
  process.exitCode = 1;
});
