# @wieslawsoltes/counterform-icons

Original MIT vector icons for font authoring. No icon font, network dependency, image sprite, or proprietary artwork.

```js
import { createIcon, iconURL, commandIcon, iconNames } from '@wieslawsoltes/counterform-icons';
button.append(createIcon('knife')); // SVG DOM, currentColor, aria-hidden
image.src = iconURL(commandIcon('outline.overlap')); // packaged SVG asset
```

Every SVG is a 24×24 coordinate canvas with consistent stroke weight and round joins. Asset URLs are statically declared so module bundlers can discover and copy them. Unknown icon names are rejected; `commandIcon` supplies a generic settings fallback for unknown command IDs. Standalone asset SVGs use a neutral blue stroke; DOM icons inherit currentColor. Callers provide accessible text or an aria-label on icon-only controls.
