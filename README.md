# My Manga Collection ♡

A cute bilingual (Traditional Chinese / English) manga and merchandise collection tracker built with plain HTML, CSS, and JavaScript. It can be hosted on GitHub Pages.

## Features

- Five collection categories: Japanese print manga, Korean print manhwa, merchandise, digital comics, and bonus items / photocards.
- Add, edit, and delete records.
- Fields for title, author, cover URL, price, currency, quantity, store/platform, arrival status, and notes.
- Search, category and arrival filters, and sorting.
- Collection totals by category.
- Traditional Chinese / English interface toggle and dark theme.
- Saves data to the current browser using `localStorage`.
- Export and import JSON backups.

## Files

- `index.html` — page structure
- `style.css` — responsive pastel pink design
- `script.js` — collection functions and local storage
- `.nojekyll` — tells GitHub Pages not to run Jekyll processing on this plain static site

## Run locally

Double-click `index.html` to open it in a browser. For a more consistent local test, use VS Code with the Live Server extension.

## Deploy to GitHub Pages

1. Sign in at [GitHub](https://github.com/).
2. Create a new repository, for example `manga-collection`. If you use GitHub Free, make it **Public** for the standard GitHub Pages setup.
3. Upload `index.html`, `style.css`, `script.js`, and `.nojekyll` to the repository root (the top level, not inside another folder). You can use **Add file → Upload files**.
4. Open the repository's **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select branch `main` and folder `/(root)`, then click **Save**.
7. Wait for the deployment to finish. Your site URL will usually look like `https://YOUR-USERNAME.github.io/manga-collection/`. Replace `YOUR-USERNAME` with your GitHub username.
8. Return to **Settings → Pages** to find the published URL.

GitHub Pages can take several minutes to publish a change. The published site is publicly accessible, so do not store private or sensitive information in the repository.

## Data and privacy notes

- Your collection entries are stored in the browser on the device/browser you use. They are not automatically synced between devices.
- Clearing browser site data can erase your collection. Use **Export JSON** regularly and keep the backup somewhere safe.
- Importing a JSON file merges entries by ID. If an incoming item has an ID that already exists, the imported entry replaces that item.
- Cover images are loaded from the URLs you provide. Avoid very large data URLs; local browser storage has limited space.
- This first version has no account system or cloud database. Cross-device sync would require a backend such as Firebase or Supabase.
- Since this is a static website, do not include private data in the source files. The repository and published site may be public.

## Customize

- Adjust colors, spacing, and responsive layout in `style.css`.
- Edit categories and interface translations near the top of `script.js`.
- Change the page title and introductory copy in `index.html`.
