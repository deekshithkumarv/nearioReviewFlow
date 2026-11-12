import { execSync } from 'child_process';

// Cloudflare's build environment installs dependencies and then runs only the configured build command.
// When that command is plain `next build`, this postinstall hook is what produces the .open-next worker bundle.
// It runs ONLY inside Cloudflare builds (Workers Builds sets WORKERS_CI, Pages sets CF_PAGES), never on a
// developer machine, in Docker, or in other CI.
const isCloudflareBuild =
  (process.env.WORKERS_CI === '1' || process.env.CF_PAGES === '1') && process.env.SKIP_OPENNEXT_POSTINSTALL !== '1';

if (isCloudflareBuild) {
  console.log('Cloudflare build detected: compiling the OpenNext worker bundle...');
  try {
    execSync('npx opennextjs-cloudflare build', { stdio: 'inherit' });
  } catch (err) {
    console.error('OpenNext build failed:', err.message);
    process.exit(1);
  }
} else {
  console.log('Skipping the OpenNext build in postinstall (not a Cloudflare build). Run `npm run build:worker` when you need it.');
}
