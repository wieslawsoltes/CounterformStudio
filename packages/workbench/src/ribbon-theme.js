/** Host-owned presentation of the pinned RibbonWeb surface. No commands are replaced.
 * Constructable styles survive the component's replaceChildren-based rerenders. */
const styles = `
:host { --rw-accent:var(--cf-accent);--rw-bg:var(--cf-panel);--rw-surface:var(--cf-panel);--rw-text:var(--cf-text);--rw-muted:var(--cf-muted);--rw-border:var(--cf-line);--rw-hover:var(--cf-hover);--rw-active:var(--cf-soft);font:12px/1.3 var(--cf-font); }
:host([theme=dark]) {--rw-bg:var(--cf-panel);--rw-surface:var(--cf-panel);--rw-text:var(--cf-text);--rw-muted:var(--cf-muted);--rw-border:var(--cf-line);--rw-hover:var(--cf-hover);--rw-active:var(--cf-soft);--rw-accent:var(--cf-accent);}
.shell {border:0;border-radius:0;display:grid;grid-template-columns:128px minmax(0,1fr);background:var(--rw-bg)}
.topline {grid-column:1;grid-row:1;padding:1px 8px;gap:3px;min-height:30px;border-bottom:1px solid var(--rw-border)}
.topline .title,.topline .search-button {display:none}
.qat button {min-height:24px;min-width:25px;border-radius:3px;padding:3px}
.qat .icon img {width:15px;height:15px}
.tabs-row {grid-column:2;grid-row:1;padding:0 5px;min-height:30px;border-bottom:1px solid var(--rw-border);border-radius:0}
.tab {font-size:11px;border-radius:0;min-height:30px;padding:6px 13px;border-bottom-width:2px}
.tab[aria-selected=true]{color:var(--rw-text);background:var(--cf-bg)}
.file-tab {font-size:11px;padding:4px 9px;min-height:26px}
.chrome-button {font-size:13px;min-height:25px;min-width:25px;padding:3px}
.panel {grid-row:2;grid-column:1/-1;min-width:0}
.simplified .panel {min-height:38px;padding:3px 8px}
.simplified .group {padding:0 9px;min-width:0}
.simplified .group-items {height:30px;gap:3px}
.simplified .control-stack {gap:2px}
.simplified .control button {width:29px;height:28px;min-height:28px;padding:4px;border-radius:3px}
.simplified .control .label {position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.simplified .control .icon img {width:19px;height:19px}
.simplified .overflow-button {min-height:28px;min-width:32px;height:30px;padding:4px;flex-direction:row}
.group-caption {font-size:10px}
.control.small button {font-size:11px;border-radius:3px}
.icon img {filter:grayscale(1) brightness(.85)}
:host([theme=dark]) .icon img {filter:brightness(0) invert(.82)}
:host([density=touch]) .simplified .panel {min-height:52px}
:host([density=touch]) .simplified .group-items {height:44px}
:host([density=touch]) .simplified .control button {width:44px;height:44px;min-height:44px}
@media(max-width:680px){.shell{grid-template-columns:105px minmax(0,1fr)}.tab{padding:6px 9px}.topline{padding:1px 2px}.tabs-row{gap:0}.simplified .group{padding:0 5px}}
`;
export function styleRibbon(ribbon) {
    const root = ribbon.shadowRoot;
    if (!root) return () => {};
    if (typeof CSSStyleSheet !== 'undefined' && 'replaceSync' in CSSStyleSheet.prototype && 'adoptedStyleSheets' in root) {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(styles);
        root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
        return () => { root.adoptedStyleSheets = root.adoptedStyleSheets.filter(s => s !== sheet); };
    }
    const style = document.createElement('style');
    style.dataset.counterformTheme = 'true';style.textContent = styles;
    const ensure = () => { if (!root.contains(style)) root.append(style); };
    const observer = new MutationObserver(ensure);
    observer.observe(root, {childList:true});ensure();
    return () => {observer.disconnect();style.remove();};
}
