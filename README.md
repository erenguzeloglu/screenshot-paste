# Screenshot Paste

Auto-copies new screenshots to your clipboard so you can **Cmd+V** (or Ctrl+V) into AI chat panels.

## The Problem

When using AI chat panels in VS Code or Cursor (Claude Code, GitHub Copilot Chat, etc.), drag-and-drop of screenshots doesn't work. You're forced to manually navigate to files or type paths.

## The Solution

Screenshot Paste watches your screenshot directory and automatically copies new screenshots to your clipboard as image data. Take a screenshot, wait ~1 second, paste.

## How It Works

1. Take a screenshot (Cmd+Shift+4 on macOS, Win+Shift+S on Windows, etc.)
2. The extension detects the new file within ~1 second
3. Status bar shows "Copied!"
4. Cmd+V / Ctrl+V to paste into any chat panel

## Features

- **Zero friction** -- take a screenshot and paste, that's it
- **Cross-platform** -- macOS, Windows, and Linux
- **Status bar indicator** -- shows when a screenshot is ready to paste
- **Configurable** -- custom watch directories, file patterns, notification style
- **Lightweight** -- no dependencies, uses native OS clipboard tools

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `screenshotPaste.enabled` | `true` | Enable/disable watching |
| `screenshotPaste.watchDirectories` | OS defaults | Directories to watch |
| `screenshotPaste.filePattern` | `Screenshot*.png` | Filename pattern to match |
| `screenshotPaste.notifications` | `statusBar` | `statusBar`, `toast`, `both`, or `none` |
| `screenshotPaste.cooldownMs` | `500` | Debounce between screenshots (ms) |

### Default Watch Directories

- **macOS**: `~/Screenshots`, `~/Desktop`
- **Windows**: `~/Pictures/Screenshots`, `~/Desktop`
- **Linux**: `~/Pictures/Screenshots`, `~/Pictures`

## Commands

- **Screenshot Paste: Toggle Watching** -- enable/disable (also clickable in status bar)
- **Screenshot Paste: Copy Last Screenshot** -- manually copy the most recent screenshot

## Requirements

- **macOS**: No extra tools needed (uses `osascript`)
- **Windows**: PowerShell (included with Windows)
- **Linux**: `xclip` or `wl-copy` (for Wayland)
