# Codepad: a mobile JavaScript and Python compiler

Codepad is a mobile code playground for iOS and Android, built with Expo and React Native. You write code in an editor, tap **Run**, and see the output a moment later.

- **JavaScript** runs in an isolated Web Worker using the device's JS engine. It supports top-level `await`, timers and a full `console` (`log`/`warn`/`error`/`table`/`time`/`group`/`count`), and objects are pretty-printed. Syntax errors show the exact line and column.
- **Python 3.14** is real CPython compiled to WebAssembly (Pyodide). `numpy`, `pandas`, `matplotlib` and about 200 other packages install automatically the first time you import them. Matplotlib charts show up as images in the console.

## Features
- CodeMirror 6 editor with syntax highlighting, autocomplete, bracket matching, auto-indent, code folding, find and replace, and undo/redo
- A key bar above the keyboard with brackets, quotes, symbols, cursor arrows, comment toggle, undo/redo and search. The keys change between Python and JS.
- A console panel you can drag between three sizes. It shows a run timer and a status chip ("Finished · 32 ms", "Error · line 3"), and tapping an error jumps to the line in the editor and highlights it.
- An **Input** tab for `input()` and `prompt()`. If a program reads input and none has been entered, Codepad asks for the values before running.
- A time limit (5, 15 or 60 s) stops infinite loops. **Stop** ends a run immediately, and output is batched and capped so programs that print a lot don't slow the app down.
- File manager with search, a JS/PY filter, pinning, rename, duplicate and delete. You can import `.py` and `.js` files, paste code from the clipboard, and share or export files.
- 15 runnable examples: async/await, classes, sorting, input, NumPy, Pandas and Matplotlib
- Dark, light and auto themes, font size, word wrap, line numbers, tab size and haptics
- Files are saved automatically on the device

## Run it
```bash
npm install
npx expo start            # needs a development build (react-native-webview is native)
npx expo run:android      # or run:ios — local dev build
```
Without a Mac or Android Studio, build in the cloud with EAS:
```bash
npx eas-cli@latest build --profile preview --platform android   # installable APK
npx eas-cli@latest build --profile production --platform ios
```

## Project layout
```
src/app/            Expo Router screens: index (files), editor/[id], templates, settings
src/components/     CodeEditor (WebView), ConsoleView, KeyBar, shared UI
src/runner.tsx      Hidden WebView that owns the JS and Python workers
src/store.tsx       Files and settings (AsyncStorage)
src/templates.ts    Example programs
web/                Source for the editor and runner bundles
src/web/*.ts        Generated bundles. Run `npm run build:web` after editing web/.
```

## Notes
- Python needs internet the first time it starts (about 10 MB runtime, then cached). Extra packages download the first time each one is imported. JavaScript always works offline.
- `input()` reads from the Input tab (one value per line). The WebView sandbox can't do truly interactive stdin.
