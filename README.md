<div align="center">

<img src="src/lib/assets/favicon.svg" width="110" alt="stick-and-slap" />

# STICK·AND·SLAP

**A neubrutalist canvas editor that slaps.**
Drop a photo, stick text + stickers + shapes, slap it down, export PNG.
Built for memers, thumbnail-makers, and anyone who wants to post something loud.

<br />

[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev)
[![SvelteKit 2](https://img.shields.io/badge/SvelteKit-2-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev/docs/kit)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Vercel](https://img.shields.io/badge/deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

![Client-side](https://img.shields.io/badge/100%25_client--side-no_backend-00E0A4?style=flat-square&labelColor=0a0a0a&color=00E0A4)
![Neubrutalist](https://img.shields.io/badge/design-neubrutalist-FF4FA3?style=flat-square&labelColor=0a0a0a&color=FF4FA3)
![From-scratch](https://img.shields.io/badge/canvas-from--scratch-FAFF00?style=flat-square&labelColor=0a0a0a&color=FAFF00)

</div>

---

## ★ &nbsp;WHAT IT DOES

- **Pick a preset** — YouTube Thumb, Instagram Post, IG/TikTok Story, X Post, or Freeform
- **Drop an image** or press `T`/`R`/`C`/`B`/`X`/`A` to add text / rect / circle / speech bubble / star / arrow
- **Transform handles** — 8 resize handles + rotate handle, drag to move, shift for uniform scale, alt for center-anchored
- **Multi-select** — marquee drag or shift-click to grab many, group-move preserves relative positions
- **Snap to guides** — pink guides appear when edges or centers align with canvas or other layers
- **Full keyboard** — JKL-style shortcuts, arrow-key nudging, undo/redo/duplicate/reorder
- **Layer panel + inspector** — show/hide, lock, delete, tweak color/font/opacity/rotation/stroke
- **Export** — walks the scene graph and re-renders to a canvas pixel-perfect. Downloads PNG at native resolution

---

## ✦ &nbsp;DESIGN LANGUAGE

Hard-inverse of the tactile-console aesthetic. White paper base, **2–3px black strokes**, **offset solid shadows** (`4px 4px 0 #000` — no blur), saturated color blocks (hot pink, acid yellow, cobalt, mint, tangerine, lilac), chunky **Archivo Black** headlines, **Caveat** handwritten accents, bouncy spring animations.

Every panel is a peeled-off sticker. Every button pushes into its own shadow on press. Decorative scribbles drift gently in the background.

---

## ⌨ &nbsp;CONTROLS

| **Action** | **Keys** |
|---|---|
| Add text | `T` |
| Add rectangle / circle | `R` / `C` |
| Add speech bubble / star / arrow | `B` / `X` / `A` |
| Delete selected | `Backspace` / `Delete` |
| Nudge 1 px · nudge 10 px | `↑ ↓ ← →` · `Shift + ↑ ↓ ← →` |
| Undo · redo | `⌘Z` · `⌘⇧Z` or `⌘Y` |
| Duplicate · select all | `⌘D` · `⌘A` |
| Bring forward · send backward | `]` · `[` |
| Bring to front · send to back | `Shift + ]` · `Shift + [` |
| Deselect | `Escape` |
| Edit text layer | Double-click |
| Hold uniform scale · center-anchor resize | `Shift` · `Alt` |
| Bypass snap | `Alt` while dragging |

Drag in empty canvas for marquee selection. Shift-click to add/remove from selection.

---

## 🧱 &nbsp;WHAT'S INSIDE

- **Scene graph** — plain data (`Layer[]`), no framework lock-in. `src/lib/state/scene.svelte.ts`
- **DOM editor + canvas export** — two renderers over the same scene, so the editor is interactive DOM and the export is pixel-perfect canvas
- **Transform math** — resize in rotated local space with anchor preservation, rotate with optional 15° snap. `src/lib/geom/transform.ts`
- **Snap-to-guides** — O(N) nearest-line computation across canvas + peer layer edges/centers. `src/lib/geom/snap.ts`
- **Undo/redo** — snapshot stack, 50-deep, transactions committed at interaction boundaries. `src/lib/state/history.svelte.ts`
- **Custom drag action** — `use:draggable` with pointer capture, axis lock, and modifier-key forwarding. `src/lib/actions/draggable.ts`
- **Zero canvas libraries** — no Fabric, Konva, or html2canvas. Hand-built scene renderer.
