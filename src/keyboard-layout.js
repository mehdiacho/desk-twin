// Provisional full-size ANSI layout. The Dixon casing dimensions and exact
// multimedia legends are not verified; keep this replaceable independently.
export const KEYBOARD_GRID = { width: 22.5, depth: 6.5 };
const keys = [];
const key = (label, x, z, w = 1, d = 1) => keys.push({ label, x, z, w, d });
const row = (labels, z, start = 0) => {
  let x = start;
  for (const entry of labels) {
    const [label, w = 1] = Array.isArray(entry) ? entry : [entry];
    key(label, x, z, w); x += w;
  }
};
key('Esc', 0, 0);
for (let i = 0; i < 12; i++) key('F' + (i + 1), 2 + i + Math.floor(i / 4) * 0.5, 0);
row(['PrtSc', 'Scroll', 'Pause'], 0, 15.5);
row(['`','1','2','3','4','5','6','7','8','9','0','-','=', ['Back',2]], 1.5);
row([['Tab',1.5],'Q','W','E','R','T','Y','U','I','O','P','[',']',['\\',1.5]], 2.5);
row([['Caps',1.75],'A','S','D','F','G','H','J','K','L',';',"'",['Enter',2.25]], 3.5);
row([['Shift',2.25],'Z','X','C','V','B','N','M',',','.','/',['Shift',2.75]], 4.5);
row([['Ctrl',1.25],['Win',1.25],['Alt',1.25],['',6.25],['Alt',1.25],['Win',1.25],['Menu',1.25],['Ctrl',1.25]],5.5);
row(['Ins','Home','PgUp'],1.5,15.5);
row(['Del','End','PgDn'],2.5,15.5);
key('↑',16.5,4.5); row(['←','↓','→'],5.5,15.5);
row(['Num','/','*','-'],1.5,18.5);
row(['7','8','9'],2.5,18.5); key('+',21.5,2.5,1,2);
row(['4','5','6'],3.5,18.5);
row(['1','2','3'],4.5,18.5); key('Enter',21.5,4.5,1,2);
key('0',18.5,5.5,2); key('.',20.5,5.5);
export const KEY_LAYOUT = Object.freeze(keys.map(Object.freeze));
