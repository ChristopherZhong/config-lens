## 2025-05-14 - [Accessibility in Shadow DOM]
**Learning:** Native fragment identifiers (e.g., `<a href="#target">`) in skip-to-content links do not automatically resolve to elements with that ID when they reside within a Shadow DOM root (common in Lit components). The browser's default behavior targets the document's light DOM.
**Action:** For SPAs using Shadow DOM, implement skip links using JavaScript-based focus management or ensures the target is accessible through the shadow boundary if using global styles. For micro-UX, focus on semantic HTML (buttons vs divs) first as it provides the highest immediate impact with lower complexity.

## 2025-05-15 - [Keyboard Navigation and Roving Tabindex for Custom Radiogroups in Shadow DOM]
**Learning:** Custom segmented controls/radiogroups (`role="radiogroup"` with `role="radio"` buttons) inside Shadow DOM roots require explicit roving `tabindex` management (`0` on active, `-1` on inactive options) and `@keydown` arrow key handling. Otherwise, keyboard users are forced to tab through every radio item individually instead of navigating with standard arrow/Home/End keys.
**Action:** Ensure custom Lit component segmented controls and radiogroups dynamically update button `tabindex` attributes based on selected state and catch `ArrowLeft`/`ArrowRight`/`Home`/`End` keydown events to programmatically transfer focus to the target radio option.

## 2025-05-16 - [Disabled Action Button Accessibility and Tooltips for Empty Document States]
**Learning:** Icon/text action buttons in Lit toolbars (like Copy and Clear) should visually disable and dynamically update `aria-label` and `title` tooltips when there is no content to act upon (e.g. "No content to copy", "Document is empty"). This prevents destructive or useless actions and informs assistive technologies clearly.
**Action:** Always derive document `isEmpty` state from content (`!content || !content.trim()`), pass it down to action toolbars, and apply standard disabled styles along with dynamic accessible labels/tooltips.

## 2025-05-17 - [Global Keyboard Shortcut Enforcement for Disabled/Empty UI States]
**Learning:** Global window-level keyboard listeners (like `Alt+Shift+F` for formatting) can bypass visual component button disabled states (`disabled` or `isEmpty`) if they do not explicitly check element availability before executing actions.
**Action:** Always guard global keydown handlers in component lifecycle callbacks with state checks (e.g., `if (this.isEmpty) return;`) so keyboard shortcuts honor disabled element states and do not trigger unintended actions on empty documents.
