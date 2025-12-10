import { spawn } from 'child_process';
import path from 'path';

const root = path.resolve(__dirname, '../../');

describe('dev-start smoke', () => {
  jest.setTimeout(5 * 60 * 1000); // 5 minutes for install/build

  it('npm run build exits successfully', (done) => {
    const cmd = spawn('npm', ['run', 'build'], { cwd: root, shell: true });
    let stdout = '';
    let stderr = '';
    cmd.stdout?.on('data', (d) => (stdout += d.toString()));
    cmd.stderr?.on('data', (d) => (stderr += d.toString()));
    cmd.on('close', (code) => {
      try {
        expect(code).toBe(0);
        done();
      } catch (err) {
        // Attach logs to error message for easier debugging
        // eslint-disable-next-line no-console
        console.error('Build stdout:\n', stdout);
        // eslint-disable-next-line no-console
        console.error('Build stderr:\n', stderr);
        done(err as Error);
      }
    });
  });
});
