import { execSync } from 'child_process';

// Cloudflare Workers CI runs on Linux (Debian / Ubuntu in /opt/buildhome)
const isCloudflareCI =
  process.env.CF_PAGES === '1' ||
  Boolean(process.env.CF_PAGES_COMMIT_SHA) ||
  (process.env.CI && process.platform === 'linux') ||
  process.platform === 'linux';

if (isCloudflareCI) {
  console.log('⚡ Cloudflare CI environment detected. Compiling OpenNext worker bundle before deployment...');
  try {
    execSync('npx opennextjs-cloudflare build', { stdio: 'inherit' });
    console.log('✅ OpenNext build completed successfully!');
  } catch (err) {
    console.error('❌ OpenNext build failed:', err.message);
    process.exit(1);
  }
} else {
  console.log('ℹ️ Local developer machine detected. Skipping postinstall OpenNext build.');
}

