# Extension Icons

Place your extension icons here:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Temporary Solution

For testing, you can create simple placeholder icons using any image editor or online tool.

Alternatively, run this command to generate placeholder icons:

```bash
# On macOS with ImageMagick:
convert -size 128x128 xc:purple -pointsize 64 -fill white -gravity center -annotate +0+0 "SF" icon128.png
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png
```

Or simply copy any PNG image and rename it to the required sizes for testing.
