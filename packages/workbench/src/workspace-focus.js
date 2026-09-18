/** Last-input-wins focus handoff for asynchronously rendered docking content.
 * No timers or unbounded retries: one optional immediate focus and one frame.
 * Inject the document and scheduler to exercise the ordering without a browser.
 */
export class WorkspaceFocus {
    constructor(doc, requestFrame, cancelFrame) {
        this.doc = doc;
        this.requestFrame = requestFrame;
        this.cancelFrame = cancelFrame;
        this.pending = null;
        this.disposed = false;
        this.cancelOnInput = () => this.cancel();
        this.cancelOnFocus = event => {
            const request = this.pending;
            if (request && event.target !== request.target && event.target !== request.origin)
                this.cancel();
        };
        doc.addEventListener('pointerdown', this.cancelOnInput, true);
        doc.addEventListener('keydown', this.cancelOnInput, true);
        doc.addEventListener('focusin', this.cancelOnFocus, true);
    }
    request(target, { valid = () => true, ready = () => {} } = {}) {
        this.cancel();
        if (this.disposed) return;
        const request = { target, origin: this.doc.activeElement, frame: null };
        this.pending = request;
        const eligible = () => !this.disposed && this.pending === request
            && target.isConnected && valid() && target.getClientRects().length > 0;
        try {
            // Keep already-visible editor commands synchronous. A hidden tab must
            // first be mounted by Dockyard's previously queued layout frame.
            if (eligible()) target.focus({ preventScroll: true });
            if (this.pending !== request) return;
            request.frame = this.requestFrame(() => {
                request.frame = null;
                try {
                    if (eligible()) {
                        ready();
                        if (eligible()) target.focus({ preventScroll: true });
                    }
                } finally {
                    if (this.pending === request) this.pending = null;
                }
            });
        } catch (error) {
            if (this.pending === request) this.cancel();
            throw error;
        }
    }
    cancel() {
        const request = this.pending;
        this.pending = null;
        if (request?.frame != null) this.cancelFrame(request.frame);
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.cancel();
        this.doc.removeEventListener('pointerdown', this.cancelOnInput, true);
        this.doc.removeEventListener('keydown', this.cancelOnInput, true);
        this.doc.removeEventListener('focusin', this.cancelOnFocus, true);
    }
}
