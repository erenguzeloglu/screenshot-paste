import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ScreenshotWatcher } from './watcher';
import { StatusBarManager } from './statusBar';
import { getConfig, onConfigChange } from './config';
import { copyImageToClipboard } from './clipboard';

let watcher: ScreenshotWatcher | undefined;
let statusBar: StatusBarManager | undefined;

export function activate(context: vscode.ExtensionContext) {
    statusBar = new StatusBarManager();
    context.subscriptions.push(statusBar);

    const startWatcher = () => {
        watcher?.dispose();
        const config = getConfig();
        if (!config.enabled) {
            statusBar?.setDisabled();
            return;
        }
        watcher = new ScreenshotWatcher(config, statusBar!);
        context.subscriptions.push(watcher);
        statusBar?.setWatching();
    };

    startWatcher();

    context.subscriptions.push(
        onConfigChange(() => startWatcher())
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('screenshotPaste.toggle', () => {
            const config = vscode.workspace.getConfiguration('screenshotPaste');
            const current = config.get('enabled', true);
            config.update('enabled', !current, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(
                `Screenshot Paste: ${!current ? 'Enabled' : 'Disabled'}`
            );
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('screenshotPaste.copyLast', async () => {
            const config = getConfig();
            let newest = '';
            let newestTs = 0;

            for (const dir of config.watchDirectories) {
                if (!fs.existsSync(dir)) continue;
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const parts = config.filePattern.split('*');
                    if (parts.length === 2 && file.startsWith(parts[0]) && file.endsWith(parts[1])) {
                        const fullPath = path.join(dir, file);
                        const stat = fs.statSync(fullPath);
                        if (stat.mtimeMs > newestTs) {
                            newest = fullPath;
                            newestTs = stat.mtimeMs;
                        }
                    }
                }
            }

            if (newest) {
                try {
                    await copyImageToClipboard(newest);
                    vscode.window.showInformationMessage(
                        `Copied ${path.basename(newest)} to clipboard`
                    );
                } catch {
                    vscode.window.showErrorMessage('Failed to copy screenshot to clipboard');
                }
            } else {
                vscode.window.showWarningMessage('No screenshots found');
            }
        })
    );
}

export function deactivate() {
    watcher?.dispose();
    statusBar?.dispose();
}
