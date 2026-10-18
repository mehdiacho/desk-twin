# Desk Twin — a working room

An interactive 3D portfolio based on Mehdi's actual desk photographs and provisional survey.
The portfolio experience follows [Lucas Martinic](https://lucasmartinic.com/); the 3D presentation reference is [Yoshik](https://yoshik-pc.vercel.app/).
The room art, equipment, project covers and writing here belong to this portfolio's own setup and handoff.

## Visitor experience

- Pick the monitor for 20 projects, the NAS for self-hosted tools, the controller for games, or the other objects for their stories.
- Hover or focus an object to see its label. **Show clues** reveals the doorways. The index provides the same destinations without requiring visual exploration.
- **Day / Night** changes scene lighting. Drag to orbit, scroll or pinch to zoom, and use **Reset view** to return to the opening composition.
- Choosing an object moves the camera toward it and opens a scrollable story beside the scene (below it on phones). Closing restores the previous camera pose. Escape, Close, and browser Back/Forward work; project detail pages have previous/next links. Search and status filters persist when returning to the list.
- **Inspect the pieces** opens the World / Parts inspector, including the room shell and individual assemblies.

The entrance and inspector share the same live Three.js objects. A seamless ground, soft filtered shadows and studio reflections frame the entrance. Five primary objects have projected accessible markers; the full text index and mesh picking reach the other stories. Geometry is provisional, not a measured reconstruction. The earlier illustration remains the fallback while 3D loads or if it cannot start; its percentage hit areas are independent of the model.

## Run and deploy

```sh
npm ci
npm test
npm run build
npx -y serve -l 5187 dist
```

Open http://localhost:5187 over HTTP. `npm run build` wraps the HTML fragment into a complete document and copies only public code/assets into `dist/`.

The existing Cloudflare Worker is `desk-twin`, at https://v2.mehdiacho.tech. Deploy with the pinned local CLI:

```sh
npm run build
npx wrangler deploy --dry-run
npx wrangler deploy
```

Three.js r0.147 and its MIT license are vendored locally. It loads asynchronously at startup while the illustration and portfolio remain usable. The room and portfolio work without WebGL. Google Fonts has local system-font fallbacks. No backend, tracking, contact form or login is required.

## Source and responsibilities

| File | Responsibility |
| --- | --- |
| `src/main.js` | Immediate content/fallback startup, asynchronous 3D loading and route coordination |
| `src/room.js` | Percentage hit areas sharing the artwork's coordinate frame; lighting and clues |
| `assets/room-day.png` | 1672 × 941 illustrated room based on the setup photograph |
| `src/navigation.js` | Scene-object destinations and URL parsing |
| `src/portfolio.js` | Story dialogs, focus, filters, search and project pagination |
| `src/portfolio-data.js` | Public project/profile fields selected from the design handoff |
| `src/portfolio.css` | Room, story overlays, responsive layout and inspector styling |
| `src/app.js` | 3D entrance, story camera, projected markers, World / Parts modes and rendering |
| `src/survey.js` | Provisional model dimensions in millimetres |
| `src/parts/` | Independently buildable desk, network, desktop and floor objects |
| `src/registry.js` | Object builders, labels, dimensions and assembly relationships |
| `src/build.js` | Primitives and the millimetre-to-metre conversion |
| `src/scene.js` | Lights, world placement, explode and part plinth |

The complete source handoff is kept under `reference/portfolio-redesign-brainstorm/project/`. Reference photos, the source archive, precise profile fields and unused personal-log text are not copied into the deployment. The original source data remains in the reference folder.

DesignSync `list_files` and `get_file` were verified through the authenticated Claude CLI after design login on 2026-09-15. The local ZIP was used for the durable asset import.

The project stories use supplied descriptions, SVG covers and four authored questions. Music recordings, a personal reading list and long-form notes were not supplied; those sections say so. Secure Vault opens its project description; this site does not implement its separate secret-sharing service.

## 3D inspector

**World:** objects placed together, orbit/pan/zoom, five camera presets and an explode slider. **Parts:** individual objects on a turntable. The desk has independently inspectable `desk.tabletop` and `desk.base`; the NAS has `nas.body` and its detachable `nas.base`. The registry can expose further subcomponents later without replacing the world.

`W` / `P` change modes. Number keys `1`–`5` select World camera presets. Shortcuts do not run while typing.

The coordinate origin is the rear-left desk corner projected onto the floor: X right, Y up, Z towards the front edge. Survey values are millimetres; scene units are metres. Dimensions remain unchanged in this portfolio pass.

| Source tag | Meaning |
| --- | --- |
| SHEET | Read from the design's provisional 1:15 elevation |
| EST | Inferred from photographs |
| SPEC | Manufacturer figure |
| MEAS | Physically measured |

There are 28 inspectable entries: 21 sheet-derived, 7 estimated, **zero physically measured**. “Surveyed” in the existing inspector refers to the design sheet, not a tape survey. The source sheet's plan/front views were used for layout; its side view has inconsistencies. The model uses simplified materials and shapes, especially the chair and guitar bag. Explode is a visual separation effect, not a collision simulation.

When measurements arrive, update values and provenance in `src/survey.js`. See [MEASUREMENTS.md](MEASUREMENTS.md) for priorities and [STACK.md](STACK.md) for technology choices.

## Verification

`npm test` covers URL/object mappings, invalid routes, tap-versus-drag/pinch/cancel handling, artwork-area coverage, cover-file existence and public-link schemes. Browser checks cover the rendered room, object doors, project search/detail/history, day/night, portrait dialogs and tabletop/base/NAS component inspection. Viewport checks are not a substitute for testing on a physical phone.
