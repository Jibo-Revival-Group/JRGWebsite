# Jibo Revival Group Website
This is our website for our project! It (surprisingly) gets indexed by search engines, so be professional and don't play songs about sticking bolts where the sun doesn't shine. (This has happened, don't question it).
## Where do I put my name in the contributors list?!
In the site-data.js file is a list of contributors which can soon include YOU!! YES YOU!!! YOU CAN BE ON THE WEBSITE :0 CAN YOU BELIEVE IT!!!!
## How do I contribute to the servers/JiboOS
Those are not in this repo. They are available to contribute on their own repositories however not on this repo.

## Search metadata and indexing
The canonical site URL is `https://www.jiborevival.com` (matching `CNAME`). Public pages include their own title, description, canonical URL, social preview metadata, and JSON-LD. Keep these aligned with visible content when editing.

`sitemap.xml` is maintained explicitly: add new public content pages there using their canonical URLs. Omit redirects, deprecated placeholders, and bundled SDK source pages. `robots.txt` advertises the sitemap. Deprecated placeholders use `noindex` and remain crawlable so search engines can read it.

After deployment, submit `https://www.jiborevival.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools, and inspect the homepage for indexing. Rankings and recrawl timing depend on search engines; metadata changes do not guarantee placement.
