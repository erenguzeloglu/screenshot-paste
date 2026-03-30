import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';

export interface Config {
    enabled: boolean;
    watchDirectories: string[];
    filePattern: string;
    notifications: 'statusBar' | 'toast' | 'both' | 'none';
    cooldownMs: number;
}

function getDefaultDirectories(): string[] {
    const home = os.homedir();
    switch (process.platform) {
        case 'darwin':
            return [
                path.join(home, 'Screenshots'),
                path.join(home, 'Desktop')
            ];
        case 'win32':
            return [
                path.join(home, 'Pictures', 'Screenshots'),
                path.join(home, 'Desktop')
            ];
        case 'linux':
            return [
                path.join(home, 'Pictures', 'Screenshots'),
                path.join(home, 'Pictures')
            ];
        default:
            return [path.join(home, 'Desktop')];
    }
}

export function getConfig(): Config {
    const cfg = vscode.workspace.getConfiguration('screenshotPaste');
    const dirs = cfg.get<string[]>('watchDirectories', []);
    return {
        enabled: cfg.get('enabled', true),
        watchDirectories: dirs.length > 0 ? dirs : getDefaultDirectories(),
        filePattern: cfg.get('filePattern', 'Screenshot*.png'),
        notifications: cfg.get('notifications', 'statusBar') as Config['notifications'],
        cooldownMs: cfg.get('cooldownMs', 500)
    };
}

export function onConfigChange(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('screenshotPaste')) {
            callback();
        }
    });
}
