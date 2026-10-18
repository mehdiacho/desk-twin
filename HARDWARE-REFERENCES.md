# Hardware references

Confirmed by the user during voice on 2026-09-15. Product identity guides geometry and reference research; it does not establish measured room placement.

| Object | Confirmed identity | Modelling notes |
| --- | --- | --- |
| NAS | UGREEN NASync DXP2800 | Two-bay enclosure. Reconcile manufacturer dimensions with the provisional survey before rescaling; preserve detachable base. |
| Controller | Xbox Series X controller, blue | Use the Series controller shell, asymmetric sticks, faceted D-pad, share button and face buttons as reference. Exact colour-edition name is not confirmed. |
| Keyboard | Dixon CS-7200G wireless multimedia keyboard | Exact model confirmed by user and Cash Crusaders listing, stock code 13709. Full-size layout with separate number pad. Listing has product photographs but does not specify casing dimensions; retain provisional size until a matching reliable specification or measurement is available. |
| Mouse | Volkano Granite Series rechargeable wireless mouse, black, VK-20196-BK | The user's spoken model code exactly matches Volkano's official listing, resolving the transcribed brand spelling. USB-C charging and a separate DPI control; use official product imagery for the shell. Casing dimensions not verified. |
| Router | TP-Link Archer AX55, AX3000 dual-band gigabit Wi-Fi 6 | User confirmed the exact model. TP-Link lists the casing as 261.1 × 134.5 × 41.0 mm (W × D × H); antenna extent must be modelled separately. Hardware revision is not confirmed. |

UGREEN's regional product page lists 231 × 109 × 177 mm (L × W × H): https://nas-es.ugreen.com/products/ugreen-nasync-dxp2800-servidor-nas?from=nas-compare. Other manufacturer/manual figures vary slightly; retain source attribution and do not mark these tape-measured.

The user supplied [Yoshik's PC scene](https://yoshik-pc.vercel.app/) as the desired 3D environment/render reference. See HANDOFF.md for the browser-observed lighting, framing and camera-transition criteria. The existing illustrated room remains separate from the actual 3D model and render.

Router source: [TP-Link Archer AX55 specifications and product imagery](https://www.tp-link.com/au/home-networking/wifi-router/archer-ax55/). Manufacturer dimensions are reference specifications, not tape measurements of the setup.

Keyboard source: [Dixon CS-7200G, Cash Crusaders](https://cashcrusaders.co.za/new-goods/dixon-wireless-multimedia-keyboard-mouse/stockcode13709). The listing includes a mouse, but the user's mouse is separately identified as the Volkano below. Do not substitute the dimensions of a generic CS7200G listing without matching the Dixon product.

Mouse source: [Volkano Granite Series, VK-20196-BK](https://za.volkano.com/shop/computer-peripherals/mouses/volkano-granite-series-rechargeable-wireless-mouse-black/).

## Amazon order reference — read 2026-09-15

Source: `C:\Users\mehdi\Downloads\Mehdi Acho Amazon Order Summary.pdf`. Product names were read from the embedded page images; exact product links below were extracted from the PDF link annotations, with tracking parameters removed. Order, payment and delivery details are intentionally not transcribed here.

The user said some ordered items are now in use. This is evidence of purchased products, not confirmation of each item's current placement. The explicit Dixon keyboard and Volkano mouse confirmations above remain authoritative for the current setup; the different keyboard/mouse in this order are additional references.

| Ordered product | Exact product link from PDF | Modelling relevance / confidence |
| --- | --- | --- |
| ATK VXE Dragonfly R1 SE+ wireless gaming mouse, black | https://www.amazon.com/dp/B0FN7H1M99 | Additional purchased mouse. Do not replace the confirmed Volkano automatically. |
| Cinati white clamp-on under-desk cable management tray | https://www.amazon.com/dp/B0BPLRX32S | Mesh tray, two desk clamps, cable openings; actual installed location needs photo matching. |
| ErGear dual monitor arm, 13–32-inch screens, tool-free VESA, 19.8 lb maximum load, max VESA 100 × 100 mm | https://www.amazon.com/dp/B0FPXFYG17 | Also confirmed verbally by user. Exact SKU is now available through the ASIN. Model the real deployed configuration; a dual-arm purchase does not imply two monitors are installed. |
| AULA WIN68 HE 60% Hall-effect wired gaming keyboard, black | https://www.amazon.com/dp/B0DT43NNNF | Additional purchased keyboard. Do not replace the confirmed Dixon automatically; standard/Pro/Max variants need care. |
| VI+AL under-desk laptop mount, Deluxe, with side storage and hook | https://www.amazon.com/dp/B0CK1H6M9M | Metal brackets/shelf under the desk; device clearance up to 1.7 inches is not its overall product size. |
| CMF by Nothing Watch 3 Pro, dark grey | https://www.amazon.com/dp/B0F66MS88R | Optional personal object; no desk placement confirmed. |
| JOYROOM magnetic cable clips, 9-pack | https://www.amazon.com/dp/B0CGRQYCPT | Small cable-routing details; position/count installed not confirmed. |
| eXtremeRate 8-in-1 magnetic metal thumbsticks, black | https://www.amazon.com/dp/B01MQ26TKS | Potential controller customization; installation on the blue controller is not confirmed. |
| Alienware AW520H wired gaming headset, Dark Side of the Moon | https://www.amazon.com/dp/B0C9VBNXNF | Strong reference for the hanging headset; match the photo before replacing the generic shell. |

### Research results and limits

- Dell's [AW520H product specification](https://www.dell.com/en-uk/shop/alienware-wired-gaming-headset-aw520h/apd/545-bbfj/gaming-audio) lists width 183.91 mm, depth 111.67 mm, height 214.39 mm. The retrieved page is the Lunar Light colour variant; the order specifies Dark Side of the Moon. Confirm the matching dark variant/manual before assigning final dimensions. Published manual figures vary slightly.
- The [eXtremeRate product page](https://www.extremerate.com/products/game-raised-analog-stick-thumb-stick-for-xbox-one-elite-ps4-controller-xoj2009) matches the black 8-in-1 magnetic thumbstick set, SKU XOJ2009. It contains normal, extended and rounded caps; installed cap choice is unknown.
- The [AULA manufacturer search](https://www.aulastar.com/search.html?keywords=win+68&method=1) exposes WIN68 HE manuals and multiple variants. Exact ordered ASIN is safer than a generic model-family search.
- ErGear search surfaced several near-identical arms. `ergear.org` was not independently established as the manufacturer's site and should not be treated as authoritative for dimensions. Use the exact Amazon ASIN or a matching manual.
- Cinati tray and VI+AL bracket dimensions were not verified from a primary manufacturer source. Third-party listings mix product/packaging measurements. Their order images provide useful geometry references without claiming measured precision.

Embedded order images were extracted under `reference/order-summary/` for local inspection. They contain personal order information: keep the whole reference folder out of deployment, screenshots for public sharing and commits.
