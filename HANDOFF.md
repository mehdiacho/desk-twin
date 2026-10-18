# Desk Twin / portfolio handoff

Updated 2026-09-17. Shared working directory: **`X:\Projects\desk-twin`**.

## User's actual goal and latest priorities

Make the portfolio look and work like https://lucasmartinic.com/, using Mehdi's own setup, equipment and project stories.

The latest voice clarification is important: improve **the real 3D model** and **its render**, separately. The user thinks the current model is only okay and wants substantially better results using existing photographs and product references, without waiting for new recordings or tape measurements. The illustrated entrance is useful portfolio work but does not satisfy that 3D request by itself.

User supplied **https://yoshik-pc.vercel.app/** as the desired 3D environment/render reference. Lucas Martinic remains the portfolio-experience reference; Yoshik now guides the actual 3D presentation. Another order summary may follow, but the existing PDF has already been inspected and documented.

### Render reference inspected on 2026-09-16

The Yoshik site was opened in the browser and inspected after its start sequence. Observed: a compact desk/chair arrangement on a seamless light-grey ground/background; an elevated three-quarter establishing view with generous empty space; soft cast and contact shadows; muted materials with rounded edges, visible keyboard keys and small desk props. Clicking to begin moves the camera into a close frontal desk view, where a working Ubuntu-style portfolio appears inside the monitor. This is an observed visual reference, not a verified claim about its rendering engine or source implementation.

Apply those qualities to Mehdi's own equipment: recognizable silhouettes and edge highlights, grounded objects, coherent soft lighting, a deliberate wide-to-close camera sequence and usable screen content. Preserve the real setup and separately inspectable assemblies. The reference does not establish that the user wants its retro computer, furniture or Ubuntu interface copied literally. Capture comparable wide and close views when assessing progress.

User wants Claude and Codex working in this same directory, with a future discussion about a proper shared workflow involving both agents and the user. **Workflow design was explicitly deferred due to usage limits.** No collaboration daemon, sync mechanism, agent delegation or new checkout has been set up. Avoid concurrent edits to the same files; read the work log first when switching.

## Read first

1. `HARDWARE-REFERENCES.md`: user-confirmed models, exact Amazon product links extracted from the supplied PDF, sources, uncertainty and additional purchased items.
2. `X:\ai.tools\worklog\projects\desk-twin.md`: append-only dated history, including Claude's deployment entry. It outranks recollection.
3. `README.md`: local operation, architecture and limitations.
4. `STACK.md`: technology trade-offs; Three.js retained, Blender a proposed later render target.
5. `MEASUREMENTS.md`: future measurement priorities, not a prerequisite for improving visual geometry now.

## Current implementation

- The default route now uses the actual live 3D desk, on a seamless studio ground, with a higher key light and VSM-filtered shadows. Mesh picking and five projected primary markers open stories. The original illustrated room remains an immediately usable fallback while the engine loads or if it fails.
- Twenty portfolio projects, SVG covers, search, status filters, detail pages, previous/next navigation, related stories, history/deep links and keyboard-accessible modal overlays.
- `src/main.js` starts content immediately and asynchronously loads the vendored engine at startup. A revision counter prevents stale asynchronous routes applying over current navigation. `setSceneRoute` coordinates entrance/story/inspector states. Stories are beside the scene on desktop and below it on portrait screens; camera moves to their object, then restores the previous pose on close. Reset view and actual day/night lighting work. Reduced motion disables flights and default turntable spin.
- The original World/Parts inspector remains: individual items, explosion view, camera presets, tabletop/base and NAS body/base subdivisions.
- Most geometry remains the original rough model. A first NAS refinement is now implemented locally: rounded shell/bezel, separated bay faces, visible numbering, lower latch relief, status lights and a rounded detachable base. The illustration is **not** a render of the scene and does not update from model dimensions.
- Further local refinements: AX55 casing with instanced diagonal vents, polished angular top and hinged antennas; a 104-key full-size keyboard with tapered keycaps and a shared legend atlas; padded chair cushions with lumbar relief and paired wheels; a continuous curved guitar-case silhouette with pocket, piping and handle. These remain provisional models, especially the keyboard's ANSI layout and chair upholstery.
- World and Parts now share a procedural PMREM studio environment for broad material reflections, in addition to the existing lights. The entrance now additionally uses a higher directional light and filtered variance shadows; inspector retains its original PCF shadows. This is still short of the reference's full asset/material quality.
- No git repository has been created here. No commit/PR workflow was performed.

## Deployment — correction to earlier Codex notes

Claude's 2026-09-15 work-log entry records deployment to **https://v2.mehdiacho.tech**, version `f4afe5ff-42dd-4b2f-8633-be24fb9808bb`, replacing the earlier model-only deployment. It also narrowed CSP to local scripts because Three.js is now vendored. Preserve those changes.

Claude verified the deployed assets with correct MIME types against the Cloudflare endpoint. A live browser check is still outstanding: local AdGuard wildcard DNS directs the domain to the NAS. Do not infer that a public deployment is broken from that LAN failure. Do not stop household DNS or change shared network configuration incidentally. Earlier Codex entries saying “not deployed” describe the state before Claude's deployment.

## Evidence / verification so far

- Six Node tests passed: object mappings, project routes, invalid route fallback, pointer gesture classification, artwork hit-area coverage, cover existence and outbound link schemes.
- Build and pinned Wrangler dry-run passed with 49 public assets.
- Browser checks: monitor opens project list; search narrows results; project detail opens; browser Back preserves search; night mode works; portrait room pans; portrait dialogs fit; multiple object doors open their stories.
- Tabletop, desk base, NAS body and NAS base were inspected individually in Parts mode. Browser error log was empty during that check.
- These checks do not prove final reference-site fidelity. After the hardware-identification conversation, the September 16 continuation refined the NAS and enabled correct sRGB palette conversion before scene construction (`THREE.ColorManagement.legacyMode = false` for vendored r147). Shadow normal bias was reduced to millimetre scale. Seven tests now pass, including rounded-geometry bounds/normals; the build passes. Browser inspection verified NAS/body/base, World and Stack with no console errors. This refinement has not been deployed.
- `src/survey.js` was unchanged at last verification: SHA256 `C258C38B6732EB4D8BEBC141A77A95D00B824B8AFD446412B6D80867294E1B06`. Zero dimensions are physically measured. SHEET means the provisional design drawing, not a tape survey.
- Update after the later September 16 pass: survey identity now names the confirmed Archer AX55 and the obsolete fin-count field is removed; physical dimensions and object positions were not changed. The previous whole-file hash is historical. Eight Node tests pass, including correct bounds for instanced geometry. Browser checks cover refined router/keyboard/NAS/chair/guitar bag and the assembled World; a clean final preview tab reported no console errors.

### September 17 entrance integration validation

Ten Node tests pass, including time-based camera arrival at 24/60/144 fps, drag interruption and immediate poses. Build passes. Browser verified physical monitor picking, NAS marker, desktop/390×844 portrait composition, story camera, search/detail/browser-Back persistence, focus restoration, night lighting, World/Parts and detachable NAS base. Simulated blocked vendor script leaves illustrated story navigation usable; reduced-motion emulation disables turntable. Browser viewport, network and media overrides were reset. Normal preview console has no errors; deliberate blocked-engine test produced the expected load error in its separate, closed tab.

This pass is **local only**; live deployment remains the September 15 version noted above. The 3D entrance is now integrated, but the overall goal is incomplete. Controller/mouse/arm/headset geometry, provisional proportions, dark NAS printing and the monitor's placeholder screen still need attention. The scene remains continuously rendered while visible; performance on a real phone has not been measured. The public studio hides the wall-mounted easter-egg object to avoid a floating prop; its direct route still works, and the inspector retains it.

Local no-store preview restarted at http://127.0.0.1:5190/ (unified exec session 28478); verify liveness before reuse. Source remains in the same shared directory.

## Next concrete work: improve the actual 3D model

1. Capture baseline World and component views; compare against the original photos and the exact hardware references. Keep separate before/after evidence of geometry and lighting changes.
2. Continue refining **UGREEN DXP2800 NAS** from the first implemented pass. Blank doors no longer obscure numbering, and shell/bezel edges, bay seams, latches and status details now have relief. The shelf photo was the direct geometry reference. Small front controls and rear grille are provisional; exact manufacturer connector layout and rear detail still need verification. Body/base remain separate. Outer survey dimensions are unchanged. Improve lighting/reflections so the dark face remains legible in the assembled stack.
3. Refine the **blue Xbox Series X controller** and **Volkano mouse** from confirmed references. The current controller is spheres/capsules with little control detail; mouse is a plain dome. Router and keyboard have an initial geometry pass now (above), but exact keyboard legends, router rear ports and personal stickers still need refinement.
4. Rebuild the articulated **ErGear mount** and **AW520H headset**, then the VI+AL laptop bracket, Cinati tray and small cable details after photo matching. Keep the single visible monitor unless evidence shows a second; dual-arm purchase alone is not evidence of two screens installed.
5. Continue photo matching the chair and guitar bag after the initial softened geometry pass. The rear profile, stitching and exact upholstery are estimates; the case depth still uses the provisional drawing.
6. Improve real-time materials and lighting: believable roughness, soft cast/contact shadows and framing. A shared procedural environment map is now present. Avoid solving all visual problems by increasing ambient light.
7. Compare the actual resulting 3D render with https://yoshik-pc.vercel.app/ in wide and close views. Keep the portfolio's room-driven storytelling and existing content intact. The improved 3D scene is now the default entrance. Continue comparing its materials, geometry and monitor interaction with the reference; the illustration is only a fallback.

Main geometry files: `src/parts/desk.js`, `network.js`, `peripherals.js`, `floorItems.js`, `room.js`; common helpers in `src/build.js`, surfaces in `src/materials.js` and `src/textures.js`, lighting/assembly in `src/scene.js`.

Manufacturer specs expose existing proportion differences (NAS and router). Reconcile axes, variants, casing vs antenna/stand size before applying a specification. Keep estimates visibly attributed; use SPEC for verified manufacturer dimensions, not MEAS. Exact room placement remains provisional. Prior preference was to leave physical dimensions alone pending measurements, so do not silently rescale the entire scene while refining shape.

## Sources and access

- Full handoff: `reference/portfolio-redesign-brainstorm/project/`, imported from `X:\Projects\Portfolio redesign brainstorm-handoff.zip`.
- Original front photo: `reference/portfolio-redesign-brainstorm/project/uploads/IMG_20260909_120448.jpg`.
- Other reference photos and shelf sheets are in that same source project. One large `_120532.jpg` failed image decoding in Codex; `sheet/ph2-shelf.png` is an alternative.
- Order PDF: `C:\Users\mehdi\Downloads\Mehdi Acho Amazon Order Summary.pdf`. The PDF has no extractable page text but does have product-link annotations and embedded JPEG page images. Images were inspected locally; public product references are transcribed in HARDWARE-REFERENCES.md.
- Claude Design project: `db533b24-d62a-435c-b926-f5d3a6d0f7e0`. Authenticated Claude CLI DesignSync list_files/get_file worked after design login. Native Codex tool exposure is absent; this is not evidence of missing account authorization.
- Built-in Codex image generation worked independently of Higgsfield's exhausted balance. The selected illustration is `assets/room-day.png`.
- Capability registry: `X:\ai.tools\docs\capability-index.md`. Check it before asking for tokens or declaring access missing.

## Run / validate

```powershell
Set-Location X:\Projects\desk-twin
npm test
npm run build
npx -y serve -l 5187 dist
```

Check for an existing server on the port first. Browser/session handles from previous turns are not durable handoff state. The `.claude/launch.json` entry under `X:\Projects` is an older preview setup; use the built `dist` directory for current verification.

Latest verification used a temporary no-store Python server on http://127.0.0.1:5190/ serving `dist` directly (unified session 28478). Revalidate that handle/port before reusing. The previous port 5187 preview reused stale module cache and once mixed new materials with an old texture module, causing `keyLegends is not a function`. A clean no-store origin resolved it; the production build already emits revalidation headers for `/src/*`.

`build-site.mjs` copies only `src`, `covers`, `assets`, `vendor` and generated HTML/headers. It must continue excluding `reference/`, order PDFs, private details and handoff notes. The PDF contains personal payment/delivery information; none belongs in the public portfolio. Source public profile fields were trimmed to omit unused personal data.

Append a dated entry to the shared work log after meaningful work. Do not rewrite other sessions' entries. No assistant attribution in commits/PRs. The overall goal remains unfinished; handoff documentation is complete, not the 3D improvement.
