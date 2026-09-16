# Third-party notices

Counterform Studio's original code is MIT licensed. It is an independent implementation, not an official FontLab product. FontLab names are used only to describe the requested compatibility target. No FontLab source code, binary, branding, artwork or licensed font files are included.

## Upstream components

- **SkiaSharpWeb 0.5.0** — `vendor/skiasharpweb/LICENSE`, MIT. See that package for bundled dependencies and attribution.
- **Dockyard 0.1.0** — `vendor/dockyard/LICENSE`, MIT. See that package for bundled dependencies and attribution.
- **TreeDataGridWeb 0.1.0** — `vendor/treedatagridweb/LICENSE`, MIT. See that package for bundled dependencies and attribution.
- **DynamicDataWeb 0.1.1** — `vendor/dynamicdataweb/LICENSE`, MIT. See that package for bundled dependencies and attribution.
- **RibbonWeb 0.1.1** — `vendor/ribbonweb/LICENSE`, MIT. See that package for bundled dependencies and attribution.
- **ReactiveWeb 0.2.0** — `vendor/reactiveweb/LICENSE`, MIT. See that package for bundled dependencies and attribution.
- **RBushWeb 0.1.1** — `vendor/rbushweb/LICENSE`, MIT. See that package for bundled dependencies and attribution.
- **QuikGraphWeb 0.2.0** — `vendor/quikgraphweb/LICENSE`, Microsoft Public License (MS-PL).
- **GridWeb 0.5.0** — `vendor/gridweb/LICENSE`, MIT. See that package for bundled dependencies and attribution.
- **RichTextWeb 0.5.0** — `vendor/richtextweb/LICENSE`, MIT. See that package for bundled dependencies and attribution.

The vendor inputs were obtained through the connected GitHub account, using published Actions artifacts/source snapshots. `vendor-lock.json` records commit identities, artifact IDs and downloaded-archive checksums. All vendored implementation files remain unchanged. Browser assembly deliberately omits unused source maps and optional PDF assets; no claim is made that this assembly republishes the complete upstream npm distributions.

SkiaSharpWeb bundles Skia/CanvasKit and related components; retain `vendor/skiasharpweb/dist/licenses`. RichTextWeb's bundled runtime includes its own dependencies; retain `vendor/richtextweb/dist/licenses`. QuikGraphWeb's MS-PL obligations remain applicable to that dependency. Do not relicense dependency code as Counterform MIT.

## fontTools algorithm attribution

The sparse-master support-region calculation in `counterform-variations` is adapted from the open-source fontTools `varLib.models.VariationModel` algorithm. The implementation does not embed or execute Python. The independent QA suite uses the separately installed Python fontTools package as an oracle. Its license is included below and in the variations npm package.

MIT License

Copyright (c) 2017 Just van Rossum

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
