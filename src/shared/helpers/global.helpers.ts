import * as os from 'os';
import * as path from 'path';

export function getDesktopPath(): string {
  const homeDir = os.homedir();
  const desktopDir = path.join(homeDir, 'Desktop');
  return desktopDir;
}
