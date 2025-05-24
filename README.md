# JULFIX

A simple user script that allows you to download code from jules.google.com if task publishing on GitHub stucks for a long time.

![](assets/stuck_example.png)

---

## 🧰 Features
- ✅ **One-click download** of all modified files as ZIP archive
- 📁 Automatically collects all open files from editor
- 🕒 Timestamped filenames for version control
- 🔌 No external dependencies beyond Tampermonkey
- 🔄 Automatic updates via GitHub

---

## 🛠️ Installation
1. Install [Tampermonkey](https://www.tampermonkey.net/) extension for your browser
2. Install [Script](https://github.com/L0wl/julfix/raw/refs/heads/master/scripts/julfix.user.js) or [Minimal](https://github.com/L0wl/julfix/raw/refs/heads/master/scripts/julfix.user.min.js)
3. Click "Install" in Tampermonkey dialog

> 🔄 Script will automatically check for updates every 24 hours via GitHub

---

## 📦 Usage
1. Open any task at [jules.google.com](https://jules.google.com)
2. Wait for interface to fully load (Monaco Editor initialization)
3. Click the green "Download ZIP" button in bottom-right corner
4. Your browser will download a ZIP archive containing:
   - All modified files
   - Original directory structure
   - Timestamped filename (ISO 8601 format)

---

## ⚙️ How It Works
1. Injects a download button into the page
2. Uses Monaco Editor API to access open files
3. Filters out temporary/cumulative files
4. Packages files using JSZip library
5. Creates a downloadable ZIP blob with timestamp

---

## 📋 Requirements
- ✅ Tampermonkey extension
- 🌐 Modern browser with ES6 support
- 📡 Internet connection for JSZip dependency
- 🧠 Monaco Editor and JSZip libraries (loaded automatically)

---

## 💬 Support
- 🐛 [Report issues](https://github.com/L0wl/julfix/issues )
- 🧠 [GitHub Repository](https://github.com/L0wl/julfix )
- 📢 Feature requests are welcome!

---

> Note: This script only works on Google Jules task pages (`https://jules.google.com/task/*`)