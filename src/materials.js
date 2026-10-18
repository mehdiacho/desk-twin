/* ============================================================================
   MATERIALS - one shared library, built once against the live THREE global.

   Parts never construct their own materials. If the ply needs to get greyer,
   it gets greyer everywhere at once.
   ========================================================================== */

import * as TEX from './textures.js';

let M = null;

export function materials(THREE) {
  if (M) return M;

  const std = (o) => new THREE.MeshStandardMaterial(o);

  M = {
    // --- the desk ---------------------------------------------------------
    plyFace: std({ map: TEX.plyFace(THREE), roughness: 0.72, metalness: 0.0 }),
    plyEdge: std({ map: TEX.plyEdge(THREE, 9), roughness: 0.78, metalness: 0.0 }),
    plyPlain: std({ color: 0xc4a273, roughness: 0.76 }),

    whiteSteel: std({ color: 0xf0efea, roughness: 0.42, metalness: 0.14 }),
    blackSteel: std({ color: 0x1e1e20, roughness: 0.48, metalness: 0.35 }),
    whitePanel: std({ color: 0xf4f2ed, roughness: 0.55 }),

    // --- devices ----------------------------------------------------------
    deviceBlack: std({ color: 0x121215, roughness: 0.58, metalness: 0.12 }),
    deviceDark: std({ color: 0x1d1d21, roughness: 0.5, metalness: 0.2 }),
    deviceWhite: std({ color: 0xf2f0ea, roughness: 0.5 }),
    nasShell: std({ color: 0x25262a, roughness: 0.44, metalness: 0.32 }),
    nasBezel: std({ color: 0x101114, roughness: 0.52, metalness: 0.05 }),
    nasDoor: std({ color: 0x202126, roughness: 0.64, metalness: 0.12 }),
    nasLabel: std({ map: TEX.nasMarkings(THREE), transparent: true,
      depthWrite: false, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -1 }),
    statusLed: std({ color: 0xc4dbed, emissive: 0x8bc8ee, emissiveIntensity: 0.45 }),
    routerGloss: std({ color: 0x111315, roughness: 0.2, metalness: 0.16 }),
    routerLed: std({ color: 0xb5d47a, emissive: 0x81aa42, emissiveIntensity: 0.6 }),
    rubber: std({ color: 0x0d0d0f, roughness: 0.92 }),
    screenOn: std({
      map: TEX.screen(THREE),
      emissiveMap: TEX.screen(THREE),
      emissive: 0xffffff,
      emissiveIntensity: 0.5,
      roughness: 0.28,
    }),
    glassDark: std({ color: 0x0b0b0d, roughness: 0.18, metalness: 0.5 }),

    // --- surfaces ---------------------------------------------------------
    mat: std({ map: TEX.deskMat(THREE), roughness: 0.94 }),
    keys: std({ map: TEX.keyField(THREE), roughness: 0.7 }),
    keyCap: std({ color: 0x27292c, roughness: 0.68 }),
    keyLegends: std({ map: TEX.keyLegends(THREE), transparent: true,
      depthWrite: false, roughness: 0.85 }),
    floor: std({ map: TEX.floorTile(THREE), roughness: 0.26, metalness: 0.02 }),
    wall: std({ map: TEX.plaster(THREE), roughness: 0.96 }),
    curtain: std({
      map: TEX.curtain(THREE), roughness: 0.9, side: THREE.DoubleSide,
    }),

    // --- objects ----------------------------------------------------------
    chrome: std({ color: 0xb9bcc0, roughness: 0.3, metalness: 0.85 }),
    castIron: std({ color: 0x1b1b1d, roughness: 0.62, metalness: 0.45 }),
    nylonBag: std({ color: 0x121215, roughness: 0.9 }),
    fabricSeam: std({ color: 0x303135, roughness: 0.95 }),
    leather: std({ color: 0x3c2320, roughness: 0.66 }),
    leatherSeam: std({ color: 0x1d1110, roughness: 0.84 }),
    wood: std({ color: 0x6e3a24, roughness: 0.6 }),
    folderYellow: std({ color: 0xd8b52a, roughness: 0.66 }),
    bookGreen: std({ color: 0x3e5240, roughness: 0.8 }),
    bookGrey: std({ color: 0x45464a, roughness: 0.8 }),
    controllerBlue: std({ color: 0x1745a3, roughness: 0.62 }),
    controllerInset: std({ color: 0x123981, roughness: 0.8 }),
    controllerPad: std({ color: 0x282a2c, roughness: 0.48, metalness: 0.22, flatShading: true }),
    controllerLegends: std({ map: TEX.controllerLegends(THREE), transparent: true,
      depthWrite: false, roughness: 0.7 }),
    mouseTop: std({ color: 0x282a2d, roughness: 0.62 }),
    mouseSide: std({ color: 0x1f2124, roughness: 0.87,
      bumpMap: TEX.gripDots(THREE), bumpScale: 0.00012 }),
    brass: std({ color: 0x9c7a3c, roughness: 0.36, metalness: 0.8 }),
    cable: std({ color: 0x131315, roughness: 0.72 }),
  };

  M.nasFrontFace = std({
    map: TEX.nasFront(THREE, ['01', '02']),
    roughness: 0.52,
    metalness: 0.1,
  });

  return M;
}
