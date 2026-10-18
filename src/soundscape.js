// Procedural placeholders for later yard / machine recordings. No autoplay.
export function createSoundscape() {
  let ctx,master,fan,disk,enabled=false,load=0,spinning=false,timer;
  const buttons=()=>document.querySelectorAll('[data-sound]');
  function ramp(param,value,seconds=.4){param.setTargetAtTime(value,ctx.currentTime,seconds);}
  function noise(frequency,gain){
    const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.5;
    const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;
    const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=frequency;
    const amp=ctx.createGain();amp.gain.value=gain;source.connect(filter).connect(amp).connect(master);source.start();
    return amp;
  }
  function tone(frequency,length=.12,gain=.08,type='sine'){
    if(!ctx||!enabled||document.hidden)return;
    const osc=ctx.createOscillator(),amp=ctx.createGain();osc.type=type;osc.frequency.value=frequency;
    amp.gain.setValueAtTime(.0001,ctx.currentTime);amp.gain.exponentialRampToValueAtTime(gain,ctx.currentTime+.008);
    amp.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+length);
    osc.connect(amp).connect(master);osc.start();osc.stop(ctx.currentTime+length+.02);
    osc.onended=()=>{osc.disconnect();amp.disconnect();};
  }
  function create(){
    const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return false;
    ctx=new Context();master=ctx.createGain();master.gain.value=.28;master.connect(ctx.destination);
    noise(1200,.065);fan=noise(420,.08);disk=noise(1800,0);
    // Sparse short chirps establish an outdoor bed without looping a recording.
    timer=setInterval(()=>{if(enabled&&!document.hidden){tone(2200+Math.random()*600,.12,.018);if(spinning)tone(130+Math.random()*400,.04,.026,'triangle');}},3700);
    return true;
  }
  function sync(){
    document.body.dataset.audio=enabled?'on':'off';
    document.body.dataset.disk=spinning?'spinning':'idle';document.body.dataset.load=String(load);
    buttons().forEach(b=>{b.textContent=enabled?'Sound on':'Sound off';b.setAttribute('aria-pressed',String(enabled));});
    if(!ctx)return;
    ramp(master.gain,enabled?.28:0,.12);ramp(fan.gain,.08+load*.3,1.3);ramp(disk.gain,spinning?.24:0,spinning?.55:1);
  }
  document.addEventListener('visibilitychange',()=>{
    if(!ctx)return;if(document.hidden)ctx.suspend();else if(enabled)ctx.resume();
  });
  return {
    async toggle(){if(!ctx&&!create())return;enabled=!enabled;if(enabled)await ctx.resume();sync();},
    activity(nextLoad=0,nextDisk=false){load=nextLoad;spinning=nextDisk;sync();},
    click(){tone(640,.04,.035,'triangle');},
    pluck(frequency){tone(frequency,1.5,.4,'triangle');tone(frequency*2,.7,.09);},
    sync,
  };
}
