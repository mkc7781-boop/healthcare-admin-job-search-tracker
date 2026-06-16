# Real Installers (Windows .exe + Android .apk)

This project is a **web app** hosted on Vercel. The installers below wrap that live app in a **real installed program** — not a browser shortcut.

Both installers connect to:

`https://healthcare-admin-job-search-tracker.vercel.app`

Your phone, Windows app, and browser all use the **same cloud data**.

---

## Windows — `.exe` installer (ready now)

1. Double-click **`build-windows-installer.bat`**
2. When finished, open **`installers\windows\dist`**
3. Run **`Healthcare Admin Job Tracker Setup 1.0.0.exe`**
4. Install like any Windows program (Start Menu + Desktop icon)

The installed app opens in its own window and syncs with your phone.

---

## Android — `.apk` file

You need **Android Studio** installed once on your PC:

1. Download: https://developer.android.com/studio
2. Install with default options (includes Java + Android SDK)
3. Double-click **`build-android-apk.bat`**
4. When finished, copy this file to your phone:

   `installers\android\android\app\build\outputs\apk\debug\app-debug.apk`

5. On your phone, open the APK and allow install from unknown sources if asked

This is a **real Android app** — it appears in your app drawer like any other app.

---

## Why it worked this way

A full native rewrite (separate Android + Windows codebases) would take weeks. These installers wrap your existing cloud app so you get:

- Real Windows installer (`.exe`)
- Real Android package (`.apk`)
- One codebase, one database, sync everywhere

---

## Rebuild after URL changes

If your Vercel URL changes, update it in:

- `installers/windows/main.js`
- `installers/android/capacitor.config.json`
- `start.bat`

Then rebuild both installers.