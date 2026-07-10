# DocCounter - Document & Charges Register

A lightweight PWA for a cyber cafe / service counter. Tap a card or document
(Aadhaar, Voter ID, Ration Card, PAN, Passport, Driving Licence, or any custom
one you add), pick **New Apply** or **Correction**, and instantly see the
document checklist and your service charge. The interface now supports English
and Bengali from the language selector in the top bar.

## Files
```
index.html     app shell and top bar
style.css      mobile-first styling
app.js         routing, language switching, data storage, screens, admin CRUD
sw.js          service worker for offline use once installed
manifest.json  PWA manifest
icons/         app icons
lib/           bundled SheetJS (xlsx) library used for Excel backup/transfer
```

## Running it
Browsers only install/run service workers over **HTTPS or localhost**. Opening
`index.html` directly with `file://` will show the app but skip offline support
and the install prompt.

- **Local test:** from this folder, run `python -m http.server 8080`, then open
  `http://localhost:8080` in Chrome/Edge.
- **Free hosting:** drag the whole folder into
  [Netlify Drop](https://app.netlify.com/drop), or push it to a GitHub repo and
  enable GitHub Pages.

Once opened over HTTPS or localhost, use **Install app** in the top bar or the
browser install icon to add it to the desktop/home screen.

## Data & admin access
- All cards, services, documents and charges are stored only on the device
  using browser `localStorage`.
- Built-in cards and services are included as starter data. Charges are counter
  service charges, not official government fees.
- Open **Counter admin** to add/edit/delete cards and services.
- Default password: `admin123`. Change it from Admin -> Settings.
- Admin login lasts for the browser tab session; closing the tab logs you out.
- **Restore defaults** in Settings resets the built-in list and removes your
  edits on that device.

## Backup & transfer between phones
Admin -> Settings -> **Backup & transfer** lets you move all cards, services,
documents and charges from one phone to another:

- **Export to Excel** builds a `.xlsx` file (readable in Excel, Google Sheets,
  WPS, etc.) with a `Cards` sheet and a `Services` sheet. On a phone/browser
  that supports the native share sheet, tapping export opens the normal
  Android/iOS share menu so you can send the file straight over **WhatsApp**,
  **Gmail**, Drive, Bluetooth, and so on. If sharing isn't available, the file
  is downloaded instead so you can attach it manually.
- **Import from Excel** opens a file picker - choose a `.xlsx` file that was
  exported from DocCounter (e.g. the one you received on WhatsApp/Gmail on the
  new phone). After confirming, it replaces this device's cards and services
  with the data from the file.
- The Excel file is a plain backup you can also keep for your own records or
  edit in a spreadsheet app before re-importing (keep the `Cards` and
  `Services` sheet names and columns the same).
- The Excel engine (SheetJS) is bundled in `lib/` so export/import also works
  offline once the app has been opened at least once over HTTPS/localhost.

## Mobile notes
The admin document entry supports both pressing Enter and tapping **Add**, so it
works on mobile keyboards that hide or change the Enter key.
