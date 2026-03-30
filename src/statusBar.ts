import * as vscode from 'vscode';

export class StatusBarManager implements vscode.Disposable {
    private item: vscode.StatusBarItem;
    private resetTimer: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        this.item = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right, 100
        );
        this.item.command = 'screenshotPaste.toggle';
        this.item.show();
    }

    setWatching() {
        this.item.text = '$(device-camera) Watching';
        this.item.tooltip = 'Screenshot Paste: Watching for new screenshots';
        this.item.backgroundColor = undefined;
    }

    setDisabled() {
        this.item.text = '$(device-camera) Off';
        this.item.tooltip = 'Screenshot Paste: Disabled (click to enable)';
    }

    showCopied(filename: string) {
        this.item.text = '$(check) Copied!';
        this.item.tooltip = `Copied ${filename} — Cmd+V to paste`;
        this.item.backgroundColor = new vscode.ThemeColor(
            'statusBarItem.warningBackground'
        );
        clearTimeout(this.resetTimer);
        this.resetTimer = setTimeout(() => this.setWatching(), 5000);
    }

    showError() {
        this.item.text = '$(error) Clipboard Error';
        this.item.backgroundColor = new vscode.ThemeColor(
            'statusBarItem.errorBackground'
        );
        clearTimeout(this.resetTimer);
        this.resetTimer = setTimeout(() => this.setWatching(), 5000);
    }

    dispose() {
        clearTimeout(this.resetTimer);
        this.item.dispose();
    }
}
