# A room you can use

Direction clarified by Mehdi on 2026-09-23; implementation continued 2026-09-24.

The public entrance combines Lucas Martinic's constrained, illustrated room with Yoshik's usable computer. No generic object-to-article popup. The full procedural 3D World/Parts inspector remains a separate mode and still needs geometry/render refinement.

## Reference inspection

Inspected both rendered pages and their actual browser-loaded JavaScript through browser DevTools on September 23.

- https://lucasmartinic.com/ uses Three.js for a subdivided image plane, depth texture, restrained camera parallax, and local liquid hover distortion. `/src/parallax.js` and `/src/main.js?v=d788cecA` load `studio.webp`, `studio-depth.webp`, sunlight mask and night image. It is a 2.5D room, with some separate real 3D toys. `/src/ui.js` places HTML projects inside the monitor bounds after the dolly. It also has a small lamp-click sound.
- https://yoshik-pc.vercel.app/ loads actual GLB computer, environment and decor with baked textures. Its browser-loaded `bundle.ee5bd72f17b93232.js` references `models/Computer/computer_setup.glb`, `models/World/environment.glb`, `models/Decor/decor.glb`, and keyboard/mouse/startup/office audio. The live `#computer-screen` iframe points to https://yoshik-portfolio.vercel.app/ and contains an Ubuntu-like desktop. This is real 3D with a staged camera, not simply a flat image.
- These are implementation references, not assets or source to copy.

## Interaction contract

1. Room: subtle parallax and localized hover ripples. Camera movement is constrained; touch can pan. Reduced motion removes movement/ripples. Each transition keeps its physical object as the point of origin.
2. Monitor: dolly into the actual screen, then use a desktop. All existing software/research projects belong in its Projects app. Browser, games and files can also live here. On phones, expand the focused monitor for legibility.
3. NAS: focus the physical UGREEN DXP2800; a distinct storage console beside it. UGOS Pro is the visual inspiration, not a claim of a live NAS session. SSD browsing stays quiet; opening an HDD file spins up the illustrative disks, then idles. Only curated public demo files until Mehdi supplies a public selection.
4. Controller: games library and a playable small game; no software-project cards masquerading as a personal games collection. Exact owned games and reviews remain to be supplied.
5. Guitar: focus the bag, unzip/reveal, optionally pluck strings. The actual guitar photo, model and personal story are pending. A generic instrument prototype must be labelled and must not invent skill level, songs or biography.
6. Other objects: related physical interactions (book/notebook pages, drawer opening, network path, sound controls). Avoid expanding every item into the same article panel.
7. Sound: user-enabled/muteable yard ambience, PC hum, disk access and musical gestures. Fan load is an authored effect tied to feature activity, not real visitor hardware telemetry. Stop active effects on exit and suspend when the tab is hidden.
8. Recursive browser: bounded to three nested room previews. Do not recursively spawn the entire renderer, and do not build an unrestricted proxy browser. Deeper scenes/game activity increase simulated fan load.

## Pending user content

Actual guitar photos/story, personal game library, public NAS file selection, authentic yard/PC/HDD recordings (procedural audio can establish behavior now), final personal object stories, exact physical measurements. None blocks interaction architecture.

## Scope and continuity

Work in `X:\Projects\desk-twin`. Keep `HANDOFF.md` and the shared work log current. User deferred broader Claude/Codex workflow design. Original photos and private purchase PDF stay outside the public build. The current room illustration is an existing approximate artwork, not a newly measured or accurate final render. New model work and revised visitor interactions are local until explicitly deployed and verified.
