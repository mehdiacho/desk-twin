# Technology choice

Use **HTML/CSS + a room illustration for the portfolio presentation**, **Three.js for the editable 3D world**, and **Blender later for detailed assets and polished 3D renders**. Keep the geometry/measurements separate from the stories so either presentation can evolve.

| Option | Fits this project when | Trade-off |
| --- | --- | --- |
| Illustration + HTML hotspots (current entrance) | Matching a warm, illustrated point-and-click portfolio; fast first paint and accessible content | Fixed viewpoint. New geometry or changed equipment needs updated artwork and hit areas. Night is a visual treatment, not simulated illumination. |
| Three.js (current inspector) | Orbitable objects, placement, per-part inspection and dimensions that will change | Detailed materials, lighting and organic shapes require more authoring; mobile GPU cost needs management. |
| React Three Fiber | A future React application needs reusable scene components and React state | It is a React renderer for Three.js, not a different modelling tool. A migration adds framework work without improving the existing meshes by itself. |
| Blender + Python | Detailed bevels, cloth, screws, material authoring, baked lighting and high-quality stills | More asset/export work. Keep objects separate with stable names and metre-scale coordinates; do not collapse the setup into one uneditable mesh. |
| CadQuery / OpenSCAD | Measured brackets, mounting holes, screw patterns or fabrication files | Precision is useful for individual manufactured parts, but scene art and browser interaction require another tool. CadQuery supports STEP export. |
| Photogrammetry / Gaussian splats | Capturing an existing room's appearance with comprehensive new photographs | Current photos do not cover hidden surfaces. Segmentation, editable components and changing dimensions make this a poor primary representation here. |
| Generated 3D assets | Producing a starting mesh for a difficult decorative object | Treat outputs as references requiring cleanup and scale checks; they do not establish physical accuracy or a useful component hierarchy. |

Start with large assemblies, then replace/refine individual objects. The tabletop/base and NAS body/base already follow this pattern. For a future Blender pipeline, preserve stable object identifiers, pivots and dimensions, export per-object GLB assets and assemble them in Three.js. That export/import pipeline is proposed, not implemented in this version.

Sources: [Three.js scene fundamentals](https://threejs.org/manual/en/fundamentals.html), [React Three Fiber introduction](https://r3f.docs.pmnd.rs/getting-started/introduction), [Blender rendering](https://www.blender.org/features/rendering/), [CadQuery introduction](https://cadquery.readthedocs.io/en/latest/intro.html). Trade-off recommendations are project-specific engineering judgement.
