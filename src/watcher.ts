import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { copyImageToClipboard } from './clipboard';
import { Config } from './config';
import { StatusBarManager } from './statusBar';

export class ScreenshotWatcher implements vscode.Disposable {
    private watchers: fs.FSWatcher[] = [];
    private lastProcessedFile = '';
    private lastProcessedTime = 0;
    private pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

    constructor(private config: Config, private statusBar: StatusBarManager) {
        this.start();
    }

    private start() {
        for (const dir of this.config.watchDirectories) {
            if (!fs.existsSync(dir)) continue;

            const watcher = fs.watch(dir, (_eventType, filename) => {
                if (!filename) return;
                if (!this.matchesPattern(filename)) return;

                const fullPath = path.join(dir, filename);
                this.scheduleProcess(fullPath);
            });

            this.watchers.push(watcher);
        }
    }

    private matchesPattern(filename: string): boolean {
        const pattern = this.config.filePattern;
        const parts = pattern.split('*');
        if (parts.length === 2) {
            return filename.startsWith(parts[0]) && filename.endsWith(parts[1]);
        }
        return filename.includes('Screenshot') && filename.endsWith('.png');
    }

    private scheduleProcess(filePath: string) {
        const existing = this.pendingTimers.get(filePath);
        if (existing) clearTimeout(existing);

        // Wait 300ms for file to finish writing
        const timer = setTimeout(() => {
            this.pendingTimers.delete(filePath);
            this.processFile(filePath);
        }, 300);

        this.pendingTimers.set(filePath, timer);
    }

    private async processFile(filePath: string) {
        const now = Date.now();
        if (now - this.lastProcessedTime < this.config.cooldownMs) return;
        if (filePath === this.lastProcessedFile) return;

        // Verify file exists and is recent
        try {
            const stat = fs.statSync(filePath);
            if (now - stat.mtimeMs > 10_000) return;
            if (stat.size === 0) return;
        } catch { return; }

        this.lastProcessedFile = filePath;
        this.lastProcessedTime = now;

        try {
            await copyImageToClipboard(filePath);
            const filename = path.basename(filePath);
            this.statusBar.showCopied(filename);

            if (this.config.notifications === 'toast' || this.config.notifications === 'both') {
                vscode.window.showInformationMessage(
                    `Screenshot copied to clipboard: ${filename}`
                );
            }
        } catch {
            this.statusBar.showError();
        }
    }

    getLastProcessedFile(): string {
        return this.lastProcessedFile;
    }

    dispose() {
        for (const w of this.watchers) w.close();
        for (const t of this.pendingTimers.values()) clearTimeout(t);
        this.watchers = [];
        this.pendingTimers.clear();
    }
}
