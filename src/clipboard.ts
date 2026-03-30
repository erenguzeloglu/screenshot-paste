import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function copyImageToClipboard(imagePath: string): Promise<void> {
    switch (process.platform) {
        case 'darwin':
            return copyImageMacOS(imagePath);
        case 'win32':
            return copyImageWindows(imagePath);
        case 'linux':
            return copyImageLinux(imagePath);
        default:
            throw new Error(`Unsupported platform: ${process.platform}`);
    }
}

async function copyImageMacOS(imagePath: string): Promise<void> {
    const escapedPath = imagePath.replace(/"/g, '\\"');
    const script = `set the clipboard to (read (POSIX file "${escapedPath}") as «class PNGf»)`;
    await execFileAsync('osascript', ['-e', script]);
}

async function copyImageWindows(imagePath: string): Promise<void> {
    const escapedPath = imagePath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const script = `
        Add-Type -AssemblyName System.Windows.Forms
        $img = [System.Drawing.Image]::FromFile("${escapedPath}")
        [System.Windows.Forms.Clipboard]::SetImage($img)
        $img.Dispose()
    `;
    await execFileAsync('powershell', ['-NoProfile', '-Command', script]);
}

async function copyImageLinux(imagePath: string): Promise<void> {
    try {
        await execFileAsync('xclip', [
            '-selection', 'clipboard',
            '-t', 'image/png',
            '-i', imagePath
        ]);
    } catch {
        await execFileAsync('bash', [
            '-c', `wl-copy --type image/png < "${imagePath.replace(/"/g, '\\"')}"`
        ]);
    }
}
