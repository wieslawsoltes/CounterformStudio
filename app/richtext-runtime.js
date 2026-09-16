/** Browser-only bridge to the unmodified upstream self-contained UMD/IIFE artifact.
 * npm consumers resolve ordinary ESM imports through the upstream package exports.
 */
const runtime=globalThis.RichTextWeb;
if(!runtime)throw new Error('RichTextWeb browser runtime was not loaded');
export const FlowDocument=runtime.FlowDocument;
export const registerRichTextWeb=runtime.registerRichTextWeb;
