# El Nido website (refactored)

## Run it
1. Copy this whole folder into VS Code (File > Open Folder).
2. Put your existing `images/` folder inside it (same file names as before).
3. Right-click `index.html` > "Open with Live Server" (install the Live Server extension).
   Double-clicking index.html also works: there is no fetch() or module import.

## Structure
- `css/tokens.css`  variables only (colors, fonts, spacing)
- `css/base.css`    everything shared by all four pages
- `css/home.css`    homepage only (species preview, slideshow)
- `css/detail.css`  species + tourist-spots pages (the .feature component)
- `js/main.js`      the only script: lightbox, thumbnails, details-from-hash, slideshow, video control
- Four pages: index, tourist-spots, endangered-species, travel-tips

## Still to do (marked TODO / VERIFY in the HTML)
- Compress the background video (course doc, section 6.11) and update the 4 <source> paths.
- Verify every conservation status against the IUCN Red List and source the stats.
- Replace the generic wildlife gallery captions and alt text.
- Fees and rules change: confirm with the El Nido tourism office.
