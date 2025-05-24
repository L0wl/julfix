# JULES FIX

A simple user script that allows you to download code from jules.google.com if task publishing on GitHub stucks for a long time.

<p align="center" width="100%">
   <img width="80%" src="assets/example_stuck.png">
   <p align="center">Publishing stucks example</p>
</p>

## 🧰 Features
- ✅ One-click download of all modified files as ZIP archive
- 📁 Automatically collects all open files from Monaco Editor
- 🕒 Timestamped filenames for version control
- 🔌 No external dependencies beyond Tampermonkey
- 🔄 Automatic updates via GitHub

## 🛠️ Installation
- Install [Tampermonkey](https://www.tampermonkey.net/) extension for your browser
- Install [Script](https://github.com/L0wl/julfix/raw/refs/heads/master/scripts/julfix.user.js) or [Minimal](https://github.com/L0wl/julfix/raw/refs/heads/master/scripts/julfix.user.min.js)
- Click "Install" in Tampermonkey dialog

## 📦 Usage
- Open any task at [jules.google.com](https://jules.google.com)
- Wait for interface to fully load (Monaco Editor initialization)
- Click the green "Download ZIP" button in bottom-right corner
- Your browser will download a ZIP archive containing:

<p align="center" width="100%">
   <img width="80%" src="assets/example_flow.png">
   <p align="center">Download flow example</p>
</p>

## ⚙️ How It Works
- Injects a download button into the page
- Uses Monaco Editor API to access open files
- Filters out temporary/cumulative files
- Packages files using JSZip library
- Creates a downloadable ZIP blob with timestamp

## 📋 Requirements
- 🙈 Tampermonkey extension
- 🌏 Modern browser with ES6 support

## 💬 Support
- 🐛 [Report issues](https://github.com/L0wl/julfix/issues)
- 🧠 [GitHub Repository](https://github.com/L0wl/julfix)
- 📢 Feature requests are welcome!

> [!NOTE]
> This script only works on Google Jules task pages (`https://jules.google.com/task/*`)
