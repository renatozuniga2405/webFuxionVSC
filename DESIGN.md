---
version: alpha
colors:
  background: "#050505"
  foreground: "#f4f0e9"
  muted: "#aaa39a"
  primary: "#ed8b47"
  gold: "#d8b575"
typography:
  display:
    fontFamily: "Arial, Helvetica, sans-serif"
  editorial:
    fontFamily: "Georgia, serif"
omitted:
  - section: spacing
    reason: "Fluid viewport composition defined in app/globals.css"
  - section: rounded
    reason: "No card system; glass geometry is illustrative"
  - section: components
    reason: "Single marketing experience, no application UI library"
---
## Overview
Spanish-language product film controlled by native scrolling. The signature is a glowing studio horizon beneath a floating, original sachet. One pinned stage, never a stack of ecommerce cards. The supplied packaging is the visual source of truth. THERMO T3 is the actual name on the supplied asset.
## Colors
Runtime source: app/globals.css :root variables --background, --foreground, --muted, --accent (primary), --gold. Per-product lighting is owned by data/products.ts. Deep black, restrained amber and gold. No medical claims or invented results.
## Typography
Large tightly tracked sans-serif display paired with restrained italic Georgia for the human habit. Small tracked uppercase navigational captions. System fonts avoid layout shifts and external font requests.
## Layout
One viewport stage with header and chapter navigation. Products centered in a wide pool of light. Editorial product information sits to the left; the preparation appears right of center. Under 700px, compact vertically arranged stage. Reduced motion and no-JavaScript use document flow.
## Elevation & Depth
Soft atmospheric light, a thin illuminated ellipse, subtle deterministic particles. Original photographs isolated with vector clipping; no AI packaging. The preparation is a stylized illustration, not a verified dosage demonstration.
## Shapes
Thin rules and small circular chapter indicators. No cards. Glass is translucent and tapered.
## Components
ProductScene shares the visual structure; sceneConfig controls entry direction, tilt and accent. GSAP timeline owns animation. Native buttons own chapter navigation and accessible static-view switching.
## Do's and Don'ts
Keep native scrolling, reversible animation, keyboard focus and visible scrollbar. Do not fabricate benefits, sales contacts, dosage or ecommerce. A configurable final CTA defaults to replay.
