// Original shader for our existing artwork. Composition zones approximate depth;
// this is not a measured scan or a copy of either reference site's shader.
export function makeRoomEffects(THREE, picture, image, areas) {
  const canvas = document.createElement('canvas');
  canvas.className = 'room-render'; canvas.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.setSize(1672, 941, false);
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
  camera.position.z = 1;
  const depth = document.createElement('canvas'); depth.width = 836; depth.height = 470;
  const ctx = depth.getContext('2d'), gradient = ctx.createLinearGradient(0, 0, 0, 470);
  gradient.addColorStop(0, '#222'); gradient.addColorStop(.5, '#666'); gradient.addColorStop(1, '#ddd');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 836, 470); ctx.filter = 'blur(6px)';
  for (const [id, [x,y,w,h]] of Object.entries(areas)) {
    ctx.fillStyle = ['projects','games','writing'].includes(id) ? '#bbb' : '#888';
    ctx.fillRect(x*8.36,y*4.70,w*8.36,h*4.70);
  }
  const texture = new THREE.Texture(image); texture.needsUpdate = true; texture.minFilter = THREE.LinearFilter;
  const uniforms = { art:{value:texture}, depth:{value:new THREE.CanvasTexture(depth)},
    pointer:{value:new THREE.Vector2(.5,.5)}, drift:{value:new THREE.Vector2()},
    area:{value:new THREE.Vector4()}, time:{value:0}, hover:{value:0} };
  const material = new THREE.ShaderMaterial({uniforms,
    vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`precision highp float;
      varying vec2 vUv; uniform sampler2D art; uniform sampler2D depth;
      uniform vec2 pointer; uniform vec2 drift; uniform vec4 area; uniform float time; uniform float hover;
      void main(){
        float d=texture2D(depth,vUv).r; vec2 uv=vUv+drift*(d-.45)*.005;
        vec2 q=(uv-area.xy)/max(area.zw,vec2(.001));
        float mask=smoothstep(0.,.14,q.x)*smoothstep(0.,.14,q.y)*smoothstep(0.,.14,1.-q.x)*smoothstep(0.,.14,1.-q.y);
        vec2 delta=(uv-pointer)*vec2(1.777,1.); float r=length(delta);
        float wave=sin(r*115.-time*6.)*exp(-r*12.);
        uv+=normalize(delta+vec2(.00001))*wave*.0024*mask*hover;
        gl_FragColor=texture2D(art,clamp(uv,.001,.999));
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
  picture.insertBefore(canvas, image.nextSibling); image.style.visibility='hidden';
  return {update(time,mouse,drift,active,strength){
    uniforms.time.value=time; uniforms.pointer.value.set(mouse.x,1-mouse.y);
    uniforms.drift.value.set(drift.x,-drift.y);uniforms.hover.value=strength;
    const a=areas[active];uniforms.area.value.set(a?a[0]/100:0,a?1-(a[1]+a[3])/100:0,a?a[2]/100:0,a?a[3]/100:0);
    renderer.render(scene,camera);
  }};
}
