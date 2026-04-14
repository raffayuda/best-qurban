# Design System Specification: Tactical Claymorphism

## 1. Overview & Creative North Star: "The Tactile Sanctuary"

This design system moves away from the flat, sterile nature of traditional FinTech to create a "Tactile Sanctuary." For a Qurban platform, trust is paramount, but so is the spiritual joy of giving. Our Creative North Star is **Organic Precision**—a visual language that feels as soft and approachable as clay, yet as disciplined as high-end editorial design.

We break the "template" look by eschewing rigid grids in favor of **Intentional Asymmetry** and **Elastic Depth**. By using inflated surfaces and high-contrast typography, we create an interface that feels physically present, inviting users to interact with the platform not as a cold transaction engine, but as a premium, modern ritual.

---

## 2. Colors & Surface Architecture

Our palette balances the prestige of Emerald and Gold with the lightness of air.

### The "No-Line" Rule
**Strict Mandate:** Traditional 1px solid borders are strictly prohibited for sectioning. Definition must be achieved through:
- **Tonal Shifts:** Transitioning from `surface` to `surface-container-low`.
- **Inner Radiance:** Using inner shadows to define boundaries.
- **Negative Space:** Allowing the `background` (#f5f7f6) to breathe between inflated components.

### Surface Hierarchy & Nesting
Treat the UI as a series of "inflated layers."
- **Level 0 (Base):** `surface` – The foundation.
- **Level 1 (Sections):** `surface-container-low` – Softly recessed areas.
- **Level 2 (Cards/Interaction):** `surface-container-lowest` (#ffffff) – The most "inflated" and prominent layer.

### The "Glass & Glow" Rule
To elevate the clay look, use `surface_tint` at 5% opacity with a `backdrop-blur` of 20px for floating navigation or overlays. Main CTAs should utilize a subtle linear gradient from `primary` (#006853) to `primary_dim` (#005b48) to give the "clay" a sense of directional lighting and "soul."

---

## 3. Typography: Editorial Authority

We use **Manrope** to anchor the playful clay visuals with professional, geometric stability.

- **Display & Headlines:** Use `display-lg` and `headline-lg` with tight letter-spacing (-0.02em). These should feel "heavy" to counterbalance the soft edges of the UI.
- **Body:** `body-lg` (1rem) is our workhorse. It must remain clean and highly legible on `surface-container-lowest` backgrounds.
- **Labels:** We introduce **Plus Jakarta Sans** for `label-md` and `label-sm`. This subtle shift in font-family for utility text (tags, captions) signals a change in context from "Storytelling" to "Data."

**Hierarchy Note:** Always lead with a `display-sm` or `headline-md` in `on_surface` to establish an editorial "hook" before dropping into functional clay components.

---

## 4. Elevation & Depth: The Claymorphic Spec

Depth in this system is not about distance from the background, but about **volume and inflation.**

### The Layering Principle
Do not use drop shadows to create height. Instead, use "Tonal Stacking."
1. **The Inflation (Inner Shadow):** Apply two inner shadows to components. One light (top-left, `on_primary` at 40% opacity) and one dark (bottom-right, `primary_dim` at 20% opacity). This creates the "pressed" clay effect.
2. **Ambient Glow:** Use extra-diffused shadows (Blur: 40px+) using a tinted version of the component's own color (e.g., a `primary` button uses a shadow of `#006853` at 10% opacity) rather than grey.

### The "Ghost Border" Fallback
If a boundary is required for accessibility, use `outline_variant` at 15% opacity. Never use 100% opacity lines; they break the organic "molded" illusion of the clay.

---

## 5. Components

### Buttons (The "Pillows")
- **Primary:** Rounded `full` (9999px). Background: `primary`. Inner shadow (Top-Left): 2px white @ 30%. Outer Glow: `primary` @ 15% (20px blur).
- **Secondary:** Rounded `full`. Background: `secondary_container` (#f5ce53). Text: `on_secondary_container`.
- **States:** On hover, the "inflation" should increase (increase inner shadow spread). On press, remove the outer glow and shift background to `primary_dim`.

### Cards & Lists
- **Cards:** Forbid divider lines. Use `surface-container-highest` for a card header background and `surface-container-lowest` for the body to create a "nested" look.
- **Rounding:** All cards must use `xl` (3rem) or `lg` (2rem) corner radius.

### Input Fields
- **Styling:** Softly recessed (inner shadow only) using `surface_container`. When focused, the "clay" should appear to inflate—transitioning from an inner shadow to an outer glow of `primary`.

### Qurban-Specific Components
- **Animal Selection Chips:** Large, `xl` rounded containers with `display-sm` pricing. Use `surface-container-lowest` with a 3D-inflated icon of the livestock.
- **Impact Progress Bar:** Instead of a flat line, use a thick, `full` rounded track (`surface_container_high`) with a `primary` "clay" fill that has a soft highlight running through the center.

---

## 6. Do's and Don'ts

### Do
- **Do** use generous whitespace (at least `xl` spacing) between clay elements to prevent the UI from feeling "cluttered" or "heavy."
- **Do** use asymmetrical layouts (e.g., a card spanning 7 columns and the description spanning 5) to maintain a bespoke, high-end feel.
- **Do** ensure all "clay" elements have a high-contrast `on_surface` or `on_primary` text for AAA accessibility.

### Don't
- **Don't** use sharp corners. Anything less than `sm` (0.5rem) rounding is a violation of the system.
- **Don't** use pure black (#000000) for shadows. Always tint shadows with the `primary` or `secondary` hue to maintain the "pastel and vibrant" warmth.
- **Don't** stack more than three layers of depth. The UI should feel like a relief carving, not a skyscraper.