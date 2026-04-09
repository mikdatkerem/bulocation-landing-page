# Design System Documentation

## 1. Overview & Creative North Star: "Architectural Precision"
This design system is engineered for the high-stakes environment of indoor navigation and spatial data management. Moving away from the "bubbly" consumer web, this system embraces a philosophy of **Architectural Precision**. It treats the dashboard not as a collection of widgets, but as a technical blueprint. 

The aesthetic is inspired by high-density enterprise consoles: serious, silent, and incredibly efficient. We achieve a "premium" feel not through decorative flourishes, but through the obsessive calibration of white space, tonal layering, and typographic hierarchy. It is a system designed for power users who value information density over visual noise.

## 2. Color & Surface Philosophy
The palette is a sophisticated range of deep navies and slate grays, designed to reduce eye strain during long technical sessions while maintaining maximum legibility.

### Surface Hierarchy & Nesting
Depth is achieved through **Tonal Layering** rather than traditional drop shadows. We use the surface-container tiers to define the "Z-axis" of the application:
*   **Base Level:** `surface` (`#060e20`) is the canvas.
*   **Structural Sidebars:** `surface_container_low` (`#06122d`) provides a subtle anchor for navigation.
*   **Primary Work Panels:** `surface_container` (`#05183c`) defines the main interaction zones.
*   **Active Overlays:** `surface_container_highest` (`#00225a`) is reserved for floating menus or critical search modals.

### The "No-Line" Rule
To maintain a high-end editorial feel, designers are prohibited from using 1px solid borders to separate major sections. Boundaries must be defined by background color shifts. For example, a data table header should be distinguished from the body by moving from `surface_container` to `surface_container_high`, not by a divider line.

### The "Ghost Border" Fallback
In high-density data views where containment is functionally required, use the **Ghost Border**. This is a 1px stroke using `outline_variant` (`#2b4680`) at **15% opacity**. It should feel like a faint mathematical guide, not a structural wall.

## 3. Typography
The system utilizes **Inter** across all scales to project a clean, technical image.

*   **Display (lg/md):** Reserved for high-level spatial metrics (e.g., "Active Users in Zone A"). Use `on_surface` with tight letter-spacing (-0.02em).
*   **Headline (sm):** Used for panel titles. These should be treated with an editorial eye—plenty of "breathing room" above and below to signal importance.
*   **Body (md/sm):** The workhorse for data. Use `on_surface_variant` (`#91aaeb`) for secondary metadata to create a clear visual hierarchy against primary `on_surface` text.
*   **Label (md/sm):** Crucial for technical readouts and form headers. Always uppercase with +0.05em letter spacing to evoke a "terminal" or "blueprint" feel.

## 4. Elevation & Depth
This system rejects traditional "soft" UI. We utilize environmental lighting and material thickness to convey importance.

*   **Layering Principle:** Instead of a flat grid, treat the UI as stacked sheets of glass. If a modal appears, it doesn't just "pop up"; it should use a `backdrop-blur` (12px to 20px) and a semi-transparent `surface_container_highest` background. This ensures the user never loses their spatial context within the navigation platform.
*   **Ambient Shadows:** When a floating state is required (e.g., a search dropdown), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4)`. The shadow should feel like a natural occlusion of light, not a dark smudge.
*   **Glassmorphism:** For top-level navigation bars or floating action panels, use a subtle transparency (85% opacity) with a blur effect. This creates a sense of "technical depth" that feels premium and intentional.

## 5. Components

### Buttons
*   **Primary:** Background `primary` (`#abc7ff`), Text `on_primary` (`#003f82`). Sharp corners (`DEFAULT` - 0.25rem). No gradients.
*   **Secondary:** Ghost style. `outline` border with `primary` text. Use for secondary actions like "Export" or "Filter."
*   **Tertiary:** Text only. Use `on_surface_variant` for inactive states, shifting to `primary` on hover.

### Form Inputs & Search
*   **Enterprise Inputs:** Use `surface_container_lowest` for the input background to create a "recessed" look. Border should be `outline` at 20% opacity, becoming 100% opaque `primary` on focus.
*   **Search-Based Selects:** Essential for navigation platforms with hundreds of "Points of Interest." These must include a search micro-interaction and use a `surface_container_high` dropdown list.

### Row-Based Data Panels
*   Forbid the use of "Card Grids." All data should be organized in horizontal panels. 
*   **Interactive Rows:** On hover, a row should shift its background from `surface` to `surface_container_low`. 
*   **Status Indicators:** Use thin, 2px vertical "pills" on the far left of a row to indicate status (e.g., `error` for a downed beacon) rather than coloring the entire row.

### Thin Linear Icons
*   Icons must be 1.5px stroke width. Use `on_surface_variant`. They should be treated as functional glyphs, never as decorative illustrations.

## 6. Do’s and Don'ts

### Do
*   **DO** use whitespace as a separator. If you think you need a line, try adding 16px of padding instead.
*   **DO** use high-contrast text for critical data. `on_surface` (`#dee5ff`) against `surface` is your primary readability tool.
*   **DO** keep border radii consistent at `0.25rem` (4px). It is just enough to take the "edge" off without losing the professional, sharp look.

### Don't
*   **DON'T** use gradients. The professionalism of this system comes from its flat, architectural confidence.
*   **DON'T** use "Consumer Blue" (#007AFF). Stick strictly to the low-saturation `primary` blue (`#abc7ff`).
*   **DON'T** use standard divider lines. If a separation is mandatory, use a 1px gap that allows the `surface_container_lowest` background to peek through.