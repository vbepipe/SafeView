(function(){ 
  ////////////////////////////////////////////////////////
  // SafeView Video Player By Vinayak Patel
  // Developed By Vinayak Patel
  // Email: vinayak.chronicles@outlook.com 
  // Copyright © 2026 Vinayak Patel. All rights reserved.
  // Permission is granted to individuals to use this software for personal, non-commercial purposes only.
  // You may not:
    // - use this software commercially;
    // - modify, adapt, or create derivative works;
    // - redistribute the software or source code;
    // - sublicense or sell this software;
    // - claim authorship or remove copyright notices. 
  // You may not reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code except where prohibited by applicable law.
  //////////////////////////////////////////////////////// 
  'use strict';

  // ---------------------------------------------------------------
  // Helper: Reduce DOM text updates
  // ---------------------------------------------------------------
  function updateText(el, text) {
    if (!el) return;
    const str = String(text);
    if (el.textContent !== str) el.textContent = str;
  }

  // ---------------------------------------------------------------
  // DOM refs
  // ---------------------------------------------------------------
  const fileInput = document.getElementById('fileInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const stage = document.getElementById('stage');
  const cpuCanvas = document.getElementById('cpuCanvas');
  const glCanvas = document.getElementById('glCanvas');
  const octx = cpuCanvas.getContext('2d');
  const emptyState = document.getElementById('emptyState');
  const analysisOverlay = document.getElementById('analysisOverlay');
  const analysisProgress = document.getElementById('analysisProgress');
  const analysisMeta = document.getElementById('analysisMeta');
  const analysisSpeedLabel = document.getElementById('analysisSpeedLabel');
  const scanCells = document.querySelectorAll('#scan3x3 span');

  const seekBar = document.getElementById('seekBar');
  const seekFrontier = document.getElementById('seekFrontier');
  const curTimeLabel = document.getElementById('curTimeLabel');
  const durLabel = document.getElementById('durLabel');
  const playBtn = document.getElementById('playBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const restartBtn = document.getElementById('restartBtn');
  const backBtn = document.getElementById('backBtn');
  const fwdBtn = document.getElementById('fwdBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const planStatus = document.getElementById('planStatus');

  const volumeGroup = document.getElementById('volumeGroup');
  const muteBtn = document.getElementById('muteBtn');
  const volIconOn = document.getElementById('volIconOn');
  const volIconOff = document.getElementById('volIconOff');
  const volumeSlider = document.getElementById('volumeSlider');

  const resPreset = document.getElementById('resPreset');
  const customResRow = document.getElementById('customResRow');
  const customResW = document.getElementById('customResW');
  const customResH = document.getElementById('customResH');

  const nrEnabled = document.getElementById('nrEnabled');
  const nrBody = document.getElementById('nrBody');
  const sNrSpatial = document.getElementById('s-nrSpatial'), vNrSpatial = document.getElementById('v-nrSpatial');
  const sNrTemporal = document.getElementById('s-nrTemporal'), vNrTemporal = document.getElementById('v-nrTemporal');
  const sNrSigma = document.getElementById('s-nrSigma'), vNrSigma = document.getElementById('v-nrSigma');

  const addNoiseEnabled = document.getElementById('addNoiseEnabled');
  const addNoiseBody = document.getElementById('addNoiseBody');
  const sAnAmount = document.getElementById('s-anAmount'), vAnAmount = document.getElementById('v-anAmount');
  const sAnScale = document.getElementById('s-anScale'), vAnScale = document.getElementById('v-anScale');
  const sAnTemporal = document.getElementById('s-anTemporal'), vAnTemporal = document.getElementById('v-anTemporal');

  const expPlanningToggle = document.getElementById('expPlanningToggle');
  const graphPanel = document.getElementById('graphPanel');
  const lumaDisabledHint = document.getElementById('lumaDisabledHint');
  const perfReduceUI = document.getElementById('perfReduceUI');

  const tabs = document.querySelectorAll('.tab');
  const tabPanels = {
    adjust: document.getElementById('tab-adjust'),
    analysis: document.getElementById('tab-analysis'),
    advanced: document.getElementById('tab-advanced'),
  };

  const sExposure = document.getElementById('s-exposure'), vExposure = document.getElementById('v-exposure');
  const sContrast = document.getElementById('s-contrast'), vContrast = document.getElementById('v-contrast');
  const sSaturation = document.getElementById('s-saturation'), vSaturation = document.getElementById('v-saturation');
  
  const sSharpness = document.getElementById('s-sharpness'), vSharpness = document.getElementById('v-sharpness');
  const sBlur = document.getElementById('s-blur'), vBlur = document.getElementById('v-blur');
  const sPlaybackSpeed = document.getElementById('s-playbackSpeed'), vPlaybackSpeed = document.getElementById('v-playbackSpeed');

  const resetAdjustBtn = document.getElementById('resetAdjustBtn');

  const rawLumaVal = document.getElementById('rawLumaVal');
  const resultLumaVal = document.getElementById('resultLumaVal');
  const curGainVal = document.getElementById('curGainVal');
  const curTargetVal = document.getElementById('curTargetVal');
  const sampleCountVal = document.getElementById('sampleCountVal');
  const outlierCountVal = document.getElementById('outlierCountVal');
  const frontierVal = document.getElementById('frontierVal');
  const targetLumaLabel = document.getElementById('targetLumaLabel');

  const sAnalysisSpeed = document.getElementById('s-analysisSpeed'), vAnalysisSpeed = document.getElementById('v-analysisSpeed');
  const sSigma = document.getElementById('s-sigma'), vSigma = document.getElementById('v-sigma');
  const sSmooth = document.getElementById('s-smooth'), vSmooth = document.getElementById('v-smooth');
  const sGainMin = document.getElementById('s-gainMin'), vGainMin = document.getElementById('v-gainMin');
  const sGainMax = document.getElementById('s-gainMax'), vGainMax = document.getElementById('v-gainMax');
  const sRenderWidth = document.getElementById('s-renderWidth'), vRenderWidth = document.getElementById('v-renderWidth');
  const renderWidthField = document.getElementById('renderWidthField');
  const sMinBuffer = document.getElementById('s-minBuffer'), vMinBuffer = document.getElementById('v-minBuffer');
  const engineToggle = document.getElementById('engineToggle');
  const engineHint = document.getElementById('engineHint');

  const fileNameLabel = document.getElementById('fileNameLabel');
  const renderResLabel = document.getElementById('renderResLabel');

  const curveCanvas = document.getElementById('curveGraph');
  const gctx = curveCanvas.getContext('2d');

  // ---------------------------------------------------------------
  // Two video elements: pbVideo (visible playback) + anVideo (background analysis)
  // ---------------------------------------------------------------
  const pbVideo = document.createElement('video');
  pbVideo.playsInline = true; pbVideo.preload = 'auto';
  pbVideo.style.position = 'absolute';
  pbVideo.style.opacity = '0';
  pbVideo.style.pointerEvents = 'none';
  pbVideo.style.width = '1px';
  pbVideo.style.height = '1px';
  pbVideo.style.zIndex = '-1';
  document.body.appendChild(pbVideo);

  const anVideo = document.createElement('video');
  anVideo.playsInline = true; anVideo.preload = 'auto'; anVideo.muted = true;
  anVideo.style.display = 'none';
  document.body.appendChild(anVideo);

  const state = {
    hasVideo:false,
    analyzing:false,          
    buffering:false,          
    planReady:false,          
    planComplete:false,       
    curveTimes: new Float32Array(0),
    curveLumas: new Float32Array(0),
    curveGains: new Float32Array(0),
    curveIdx:0,
    frontier:0,
    targetLuma:0.5,
    outlierCount:0,
    adjust:{ exposure:0, contrast:0, saturation:20, sharpness:0, blur:0, playbackSpeed:1 },
    adv:{ analysisSpeed:1, sigma:1.0, smoothWindow:3.0, gainMin:0.1, gainMax:1.0, renderWidth:640, minBuffer:9 },
    engine:'gpu',              
    lut:new Uint8ClampedArray(256),
    srgbToLinearLUT:new Float32Array(256),
    lastResultLuma:0,
    lastRawLuma:0,
    lastGain:1,
    rafId:null,
    output:{ preset:'native', width:0, height:0 },     
    audio:{ volume:1, muted:false, prevVolume:1 },
    noise:{ enabled:false, spatial:1.00, temporal:0.11, sigma:1.0 },
    addNoise:{ enabled:true, amount:1, scale:1.0, temporal:1, time:0 },
    expPlanning:{ enabled:false },       
    perf:{ reduceUI:false },             
  };

  let cpuFrameBuf = null;      

  for(let i=0;i<256;i++){
    const c = i/255;
    state.srgbToLinearLUT[i] = c<=0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4);
  }
  function linearToSrgb(c){
    c = Math.min(1,Math.max(0,c));
    return c<=0.0031308 ? c*12.92 : 1.055*Math.pow(c,1/2.4)-0.055;
  }

  let playbackLoopRunning = false;
  let lastRenderedTime = -1;

  // ---------------------------------------------------------------
  // Web Worker for Analysis
  // ---------------------------------------------------------------
  const workerBlob = new Blob([`
    let actx = null;
    let offscreen = null;
    
    const MAX_SAMPLES = 72000; 
    let times = new Float32Array(MAX_SAMPLES);
    let lumas = new Float32Array(MAX_SAMPLES);
    let rawGains = new Float32Array(MAX_SAMPLES);
    let smoothedGains = new Float32Array(MAX_SAMPLES);
    let sampleCount = 0;
    
    let sumLuma = 0;
    let sumSqLuma = 0;
    
    let adv = { sigma: 1.0, smoothWindow: 3.0, gainMin: 0.1, gainMax: 1.0 };
    
    self.onmessage = function(e) {
      const msg = e.data;
      if (msg.type === 'init') {
        if (typeof OffscreenCanvas !== 'undefined') {
          offscreen = new OffscreenCanvas(3, 3);
        } else {
          offscreen = new OffscreenCanvas(3, 3);
        }
        actx = offscreen.getContext('2d', {willReadFrequently: true});
        adv = msg.adv;
        sampleCount = 0;
        sumLuma = 0;
        sumSqLuma = 0;
      } else if (msg.type === 'updateAdv') {
        adv = msg.adv;
        recomputeAll();
      } else if (msg.type === 'sample') {
        const bmp = msg.bmp;
        const t = msg.t;
        
        actx.drawImage(bmp, 0, 0, 3, 3);
        bmp.close();
        
        const d = actx.getImageData(0, 0, 3, 3).data;
        let sum = 0;
        let lumas9 = new Float32Array(9);
        for(let i=0; i<9; i++) {
          const o = i*4;
          const l = (0.2126*d[o] + 0.7152*d[o+1] + 0.0722*d[o+2])/255;
          lumas9[i] = l;
          sum += l;
        }
        const avg = sum / 9;
        
        addSample(t, avg);
        
        if (msg.requestPlan) {
          sendPlan(false, lumas9);
        } else {
          self.postMessage({ type: 'progress', t: t, luma: avg, sampleCount: sampleCount, lumas9: lumas9 });
        }
      } else if (msg.type === 'finish') {
        sendPlan(true);
      }
    };
    
    function addSample(t, luma) {
      if (sampleCount >= MAX_SAMPLES) return;
      times[sampleCount] = t;
      lumas[sampleCount] = luma;
      
      sumLuma += luma;
      sumSqLuma += luma * luma;
      
      sampleCount++;
    }
    
    let targetLuma = 0.5;
    let outlierCount = 0;
    
    function updatePlanIncremental() {
      if (sampleCount === 0) return;
      
      const mean = sumLuma / sampleCount;
      const variance = (sumSqLuma / sampleCount) - (mean * mean);
      const std = Math.sqrt(Math.max(0, variance));
      
      const k = adv.sigma;
      let validSum = 0;
      let validCount = 0;
      
      for (let i = 0; i < sampleCount; i++) {
        if (Math.abs(lumas[i] - mean) <= k * std) {
          validSum += lumas[i];
          validCount++;
        }
      }
      
      targetLuma = validCount > 0 ? validSum / validCount : mean;
      outlierCount = sampleCount - validCount;
      
      const gMin = adv.gainMin;
      const gMax = adv.gainMax;
      
      for (let i = 0; i < sampleCount; i++) {
        const g = lumas[i] > 0.001 ? targetLuma / lumas[i] : gMax;
        rawGains[i] = Math.min(gMax, Math.max(gMin, g));
      }
      
      const w = adv.smoothWindow;
      let lo = 0, hi = 0, windowSum = 0, windowCount = 0;
      for (let i = 0; i < sampleCount; i++) {
        const t = times[i];
        while (hi < sampleCount && times[hi] <= t + w/2) { windowSum += rawGains[hi]; windowCount++; hi++; }
        while (lo < sampleCount && times[lo] < t - w/2) { windowSum -= rawGains[lo]; windowCount--; lo++; }
        smoothedGains[i] = windowCount > 0 ? windowSum / windowCount : rawGains[i];
      }
    }
    
    function recomputeAll() {
      sumLuma = 0;
      sumSqLuma = 0;
      for(let i=0; i<sampleCount; i++) {
        sumLuma += lumas[i];
        sumSqLuma += lumas[i] * lumas[i];
      }
      updatePlanIncremental();
      sendPlan();
    }
    
    function sendPlan(isComplete = false, lumas9 = null) {
      updatePlanIncremental();
      
      const tSlice = times.slice(0, sampleCount);
      const lSlice = lumas.slice(0, sampleCount);
      const gSlice = smoothedGains.slice(0, sampleCount);
      
      const msg = {
        type: 'plan',
        times: tSlice,
        lumas: lSlice,
        gains: gSlice,
        targetLuma: targetLuma,
        outlierCount: outlierCount,
        sampleCount: sampleCount,
        isComplete: isComplete
      };
      if (lumas9) msg.lumas9 = lumas9;
      
      self.postMessage(msg, [tSlice.buffer, lSlice.buffer, gSlice.buffer]);
    }
  `], { type: 'application/javascript' });

  const workerUrl = URL.createObjectURL(workerBlob);
  const analysisWorker = new Worker(workerUrl);

  analysisWorker.onmessage = (e) => {
    const msg = e.data;
    if (msg.type === 'progress' || msg.type === 'plan') {
      if (msg.lumas9 && !state.perf.reduceUI) {
        scanCells.forEach((c, idx) => {
          c.style.background = `rgba(255,176,0,${0.15 + msg.lumas9[idx] * 0.7})`;
        });
      }
    }

    if (msg.type === 'plan') {
      state.curveTimes = msg.times;
      state.curveLumas = msg.lumas;
      state.curveGains = msg.gains;
      state.targetLuma = msg.targetLuma;
      state.outlierCount = msg.outlierCount;
      graphCacheValid = false;
      
      updateText(targetLumaLabel, 'target ' + state.targetLuma.toFixed(3));
      updateText(sampleCountVal, msg.sampleCount);
      updateText(outlierCountVal, state.outlierCount);
      updateText(curTargetVal, state.targetLuma.toFixed(3));
      
      if (msg.isComplete) {
        state.planComplete = true;
        if(state.buffering){ unlockPlayback(); } 
        analyzeBtn.disabled = false;
        updateText(planStatus, 'Plan complete · '+state.curveTimes.length+' pts');
        seekFrontier.style.width = '100%';
        updateText(frontierVal, 'complete');
        drawPlayhead(pbVideo.currentTime||0);
      }
    }

  };

  // ---------------------------------------------------------------
  // File loading
  // ---------------------------------------------------------------
  fileInput.addEventListener('change', (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    
    pbVideo.pause();
    const url = URL.createObjectURL(f);
    pbVideo.src = url;
    anVideo.src = url;
    updateText(fileNameLabel, f.name);
    state.hasVideo = true;
    state.planReady = false;
    state.planComplete = false;
    state.analyzing = false;
    state.curveTimes = new Float32Array(0);
    state.curveLumas = new Float32Array(0);
    state.curveGains = new Float32Array(0);
    state.frontier = 0;
    updateText(planStatus, 'No plan yet');
    emptyState.style.display = 'flex';
    cpuCanvas.style.display = 'none';
    glCanvas.style.display = 'none';
    updateExpPlanningUI();
    [restartBtn, backBtn, fwdBtn, fullscreenBtn].forEach(b=>b.disabled=true);
    playBtn.disabled = true;
    seekBar.disabled = true;
    seekFrontier.style.width = '0%';
    cpuFrameBuf = null;
    prevFrameValid = false;
    playbackLoopRunning = false; 
    lastRenderedTime = -1;
    drawEmptyGraph();
  });

  pbVideo.addEventListener('loadedmetadata', ()=>{
    updateText(durLabel, fmtTime(pbVideo.duration));
    seekBar.max = Math.floor(pbVideo.duration*1000);
    resizeCanvases();
  });

  function computeOutputSize(vw, vh){
    const preset = state.output.preset;
    if(preset === 'native') return {w:vw, h:vh, native:true};
    if(preset === 'best') {
      return {w:Math.max(16, Math.round(vw/2)), h:Math.max(16, Math.round(vh/2)), native:false};
    }
    if(preset === 'custom' || preset === 'nativeScreen'){
      return {w:Math.max(16, state.output.width||vw), h:Math.max(16, state.output.height||vh), native:false};
    }
    const [pw, ph] = preset.split('x').map(Number);
    return {w:pw, h:ph, native:false};
  }

  function resizeCanvases(){
    const vw = pbVideo.videoWidth || 16, vh = pbVideo.videoHeight || 9;
    const out = computeOutputSize(vw, vh);

    let cpuChanged = false;
    let glChanged = false;

    if(out.native){
      const scale = Math.min(1, state.adv.renderWidth/vw);
      const cw = Math.max(2, Math.round(vw*scale)), ch = Math.max(2, Math.round(vh*scale));
      if (cpuCanvas.width !== cw || cpuCanvas.height !== ch) {
        cpuCanvas.width = cw; cpuCanvas.height = ch;
        cpuChanged = true;
      }
      if (glCanvas.width !== vw || glCanvas.height !== vh) {
        glCanvas.width = vw; glCanvas.height = vh;
        glChanged = true;
      }
    } else {
      if (cpuCanvas.width !== out.w || cpuCanvas.height !== out.h) {
        cpuCanvas.width = out.w; cpuCanvas.height = out.h;
        cpuChanged = true;
      }
      if (glCanvas.width !== out.w || glCanvas.height !== out.h) {
        glCanvas.width = out.w; glCanvas.height = out.h;
        glChanged = true;
      }
    }

    if (glChanged && gl) {
      disposeGLResources();
      initGL(true);
    } else if (gl && !glChanged) {
      gl.viewport(0,0,glCanvas.width, glCanvas.height); 
      ensurePrevFrameTex();
    }

    if (cpuChanged) {
      cpuFrameBuf = null; 
    }
    
    updateRenderResLabel();
  }

  function updateRenderResLabel(){
    const tag = state.output.preset==='native' ? (state.engine==='gpu' ? ' (native)' : ' (scaled)') : ' (fixed)';
    if(state.engine==='gpu') updateText(renderResLabel, glCanvas.width+'×'+glCanvas.height+tag);
    else updateText(renderResLabel, cpuCanvas.width+'×'+cpuCanvas.height+tag);
  }

  function fmtTime(t){
    if(!isFinite(t)) return '00:00';
    const m = Math.floor(t/60), s = Math.floor(t%60);
    return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  }

  // ---------------------------------------------------------------
  // Sliders wiring
  // ---------------------------------------------------------------
  function wireSlider(el, label, fmt, key, group, onChange){
    el.addEventListener('input', ()=>{
      const v = parseFloat(el.value);
      state[group][key] = v;
      updateText(label, fmt(v));
      if (onChange) onChange();
    });
  }
  wireSlider(sExposure, vExposure, v=>v.toFixed(2)+' EV', 'exposure','adjust');
  wireSlider(sContrast, vContrast, v=>v.toFixed(0), 'contrast','adjust');
  wireSlider(sSaturation, vSaturation, v=>v.toFixed(0), 'saturation','adjust');
  wireSlider(sSharpness, vSharpness, v=>v.toFixed(0), 'sharpness','adjust');
  wireSlider(sBlur, vBlur, v=>v.toFixed(0), 'blur','adjust');
  wireSlider(sPlaybackSpeed, vPlaybackSpeed, v=>v.toFixed(2)+'×', 'playbackSpeed','adjust');
  
  sPlaybackSpeed.addEventListener('input', () => { pbVideo.playbackRate = state.adjust.playbackSpeed; });

  const updateAdv = () => analysisWorker.postMessage({ type: 'updateAdv', adv: state.adv });
  wireSlider(sAnalysisSpeed, vAnalysisSpeed, v=>v.toFixed(0)+'×', 'analysisSpeed','adv', updateAdv);
  wireSlider(sSigma, vSigma, v=>v.toFixed(1)+'σ', 'sigma','adv', updateAdv);
  wireSlider(sSmooth, vSmooth, v=>v.toFixed(2)+'s', 'smoothWindow','adv', updateAdv);
  wireSlider(sGainMin, vGainMin, v=>v.toFixed(2)+'×', 'gainMin','adv', updateAdv);
  wireSlider(sGainMax, vGainMax, v=>v.toFixed(2)+'×', 'gainMax','adv', updateAdv);
  wireSlider(sMinBuffer, vMinBuffer, v=>v.toFixed(1)+'s', 'minBuffer','adv');
  sRenderWidth.addEventListener('input', ()=>{
    const v = parseInt(sRenderWidth.value,10);
    state.adv.renderWidth = v;
    updateText(vRenderWidth, v+'px');
    if(state.output.preset==='native') resizeCanvases();
  });

  // ---------------------------------------------------------------
  // Add Noise (Dither/Grain)
  // ---------------------------------------------------------------
  addNoiseEnabled.addEventListener('change', ()=>{
    state.addNoise.enabled = addNoiseEnabled.checked;
    addNoiseBody.classList.toggle('disabled', !state.addNoise.enabled);
    if(pbVideo.paused) renderStaticFrame();
  });
  wireSlider(sAnAmount, vAnAmount, v=>v.toFixed(0)+'%', 'amount', 'addNoise', ()=> { if(pbVideo.paused) renderStaticFrame(); });
  wireSlider(sAnScale, vAnScale, v=>v.toFixed(1)+'px', 'scale', 'addNoise', ()=> { if(pbVideo.paused) renderStaticFrame(); });
  wireSlider(sAnTemporal, vAnTemporal, v=>v.toFixed(0)+'%', 'temporal', 'addNoise', ()=> { if(pbVideo.paused) renderStaticFrame(); });

  // ---------------------------------------------------------------
  // Output resolution
  // ---------------------------------------------------------------
  resPreset.addEventListener('change', ()=>{
    state.output.preset = resPreset.value;
    customResRow.style.display = resPreset.value==='custom' ? 'flex' : 'none';

    if(resPreset.value==='custom'){
      state.output.width = parseInt(customResW.value,10)||1920;
      state.output.height = parseInt(customResH.value,10)||1080;
    }

    if(resPreset.value==='nativeScreen'){
      state.output.width = parseInt(screen.width)||1920; 
      state.output.height = parseInt(screen.height)||1080; 
      customResRow.style.display = 'none';
    }

    resizeCanvases();

    if(state.hasVideo && pbVideo.paused) renderStaticFrame();

  });
  function applyCustomRes(){
    state.output.width = Math.max(16, parseInt(customResW.value,10)||1920);
    state.output.height = Math.max(16, parseInt(customResH.value,10)||1080);
    resizeCanvases();
    if(state.hasVideo && pbVideo.paused) renderStaticFrame();
  }
  customResW.addEventListener('change', applyCustomRes);
  customResH.addEventListener('change', applyCustomRes);

  // ---------------------------------------------------------------
  // Volume / mute
  // ---------------------------------------------------------------
  pbVideo.volume = state.audio.volume;
  function updateVolumeIcon(){
    const muted = state.audio.muted || state.audio.volume===0;
    volIconOn.style.display = muted ? 'none' : 'block';
    volIconOff.style.display = muted ? 'block' : 'none';
    muteBtn.title = muted ? 'Unmute' : 'Mute';
  }
  volumeSlider.addEventListener('input', ()=>{
    const v = parseFloat(volumeSlider.value);
    state.audio.volume = v;
    pbVideo.volume = v;
    state.audio.muted = v===0;
    pbVideo.muted = state.audio.muted;
    updateVolumeIcon();
  });
  muteBtn.addEventListener('click', ()=>{
    state.audio.muted = !state.audio.muted;
    pbVideo.muted = state.audio.muted;
    if(!state.audio.muted && state.audio.volume===0){
      state.audio.volume = state.audio.prevVolume || 1;
      pbVideo.volume = state.audio.volume;
      volumeSlider.value = state.audio.volume;
    } else if(state.audio.muted){
      state.audio.prevVolume = state.audio.volume || 1;
    }
    updateVolumeIcon();
  });
  updateVolumeIcon();

  // ---------------------------------------------------------------
  // Noise reduction
  // ---------------------------------------------------------------
  nrEnabled.addEventListener('change', ()=>{
    state.noise.enabled = nrEnabled.checked;
    nrBody.classList.toggle('disabled', !state.noise.enabled);
    prevFrameValid = false; 
    if(cpuFrameBuf) cpuFrameBuf.prev = null; 
  });
  sNrSpatial.addEventListener('input', ()=>{
    state.noise.spatial = parseInt(sNrSpatial.value,10)/100;
    updateText(vNrSpatial, sNrSpatial.value+'%');
  });
  sNrTemporal.addEventListener('input', ()=>{
    state.noise.temporal = parseInt(sNrTemporal.value,10)/100;
    updateText(vNrTemporal, sNrTemporal.value+'%');
  });
  sNrSigma.addEventListener('input', ()=>{
    state.noise.sigma = parseFloat(sNrSigma.value);
    updateText(vNrSigma, state.noise.sigma.toFixed(2)+'σ');
  });

  // ---------------------------------------------------------------
  // Exposure Planning
  // ---------------------------------------------------------------
  function enablePlaybackControls(){
    [restartBtn, backBtn, fwdBtn, fullscreenBtn].forEach(b=>b.disabled=false);
    playBtn.disabled = false;
    seekBar.disabled = false;
  }
  function updateExpPlanningUI(){
    const on = state.expPlanning.enabled;
    analyzeBtn.style.display = on ? 'inline-flex' : 'none';
    analyzeBtn.disabled = !(on && state.hasVideo && !state.analyzing);
    graphPanel.style.display = on ? 'block' : 'none';
    lumaDisabledHint.style.display = on ? 'none' : 'block';
    if(!on){
      if(state.analyzing){
        state.analyzing = false;
        cancelAnimationFrame(state.rafId);
        anVideo.pause();
        anVideo.playbackRate = 1;
        analysisWorker.postMessage({ type: 'finish' });
      }
      analysisOverlay.classList.add('hidden');
      updateText(planStatus, state.hasVideo ? 'Exposure planning disabled — playing raw' : 'No plan yet');
      if(state.hasVideo) enablePlaybackControls();
    } else if(state.hasVideo && !state.planReady){
      updateText(planStatus, 'No plan yet');
    }
  }
  expPlanningToggle.addEventListener('change', ()=>{
    state.expPlanning.enabled = expPlanningToggle.checked;
    updateExpPlanningUI();
  });
  updateExpPlanningUI();

  perfReduceUI.addEventListener('change', ()=>{
    state.perf.reduceUI = perfReduceUI.checked;
    document.body.classList.toggle('perf-mode', state.perf.reduceUI);
  });

  resetAdjustBtn.addEventListener('click', ()=>{
    sExposure.value=0; sContrast.value=0; sSaturation.value=20;
    sSharpness.value=0; sBlur.value=0; sPlaybackSpeed.value=1;
    state.adjust = {exposure:0, contrast:0, saturation:20, sharpness:0, blur:0, playbackSpeed:1};
    updateText(vExposure, '0.0 EV'); updateText(vContrast, '0'); updateText(vSaturation, '20');
    updateText(vSharpness, '0'); updateText(vBlur, '0'); updateText(vPlaybackSpeed, '1.00×');
    pbVideo.playbackRate = 1;

    sAnAmount.value = 1; sAnScale.value = 1.0; sAnTemporal.value = 1;
    state.addNoise.amount = 1; state.addNoise.scale = 1.0; state.addNoise.temporal = 1;
    updateText(vAnAmount, '1%'); updateText(vAnScale, '1.0px'); updateText(vAnTemporal, '1%');
    if (!addNoiseEnabled.checked) {
      addNoiseEnabled.checked = true;
      state.addNoise.enabled = true;
      addNoiseBody.classList.remove('disabled');
    }
    if(pbVideo.paused) renderStaticFrame();
  });

  tabs.forEach(t=>{
    t.addEventListener('click', ()=>{
      tabs.forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      Object.values(tabPanels).forEach(p=>p.style.display='none');
      tabPanels[t.dataset.tab].style.display='block';
    });
  });

  // ---------------------------------------------------------------
  // Render engine toggle
  // ---------------------------------------------------------------
  engineToggle.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const eng = btn.dataset.engine;
      if(eng==='gpu' && !initGL()){
        updateText(engineHint, 'WebGL is not available in this browser — staying on the CPU scaled engine.');
        return;
      }
      state.engine = eng;
      engineToggle.querySelectorAll('button').forEach(b=>b.classList.toggle('active', b===btn));
      renderWidthField.style.opacity = eng==='gpu' ? 0.35 : 1;
      renderWidthField.style.pointerEvents = eng==='gpu' ? 'none' : 'auto';
      updateText(engineHint, eng==='gpu'
        ? 'Full native video resolution, single-pass GPU shader with a simplified 2.2 gamma approximation for speed.'
        : 'Per-pixel accurate exact-sRGB pass, downscaled to the render width below for playback performance.');
      if(state.hasVideo){
        cpuCanvas.style.display = eng==='cpu' ? 'block' : 'none';
        glCanvas.style.display = eng==='gpu' ? 'block' : 'none';
      }
      updateRenderResLabel();
      if(pbVideo.paused) renderStaticFrame();
    });
  });

  // ---------------------------------------------------------------
  // BACKGROUND ANALYSIS PASS
  // ---------------------------------------------------------------
  analyzeBtn.addEventListener('click', startAnalysis);

  let lastPlanRecompute = 0;

  async function startAnalysis(){
    if(!state.hasVideo || state.analyzing || !state.expPlanning.enabled) return;
    state.analyzing = true;
    state.buffering = true;
    state.planReady = false;
    state.planComplete = false;
    
    state.curveTimes = new Float32Array(0);
    state.curveLumas = new Float32Array(0);
    state.curveGains = new Float32Array(0);
    state.frontier = 0;
    
    analysisWorker.postMessage({ type: 'init', adv: state.adv });
    
    analyzeBtn.disabled = true;
    updateText(analysisSpeedLabel, state.adv.analysisSpeed);
    analysisOverlay.classList.remove('hidden');
    updateText(planStatus, 'Buffering…');
    playBtn.disabled = true;
    seekBar.disabled = true;

    anVideo.pause();
    anVideo.muted = true;
    if(anVideo.currentTime !== 0){
      anVideo.currentTime = 0;
      await waitForSeek(anVideo);
    }
    anVideo.playbackRate = state.adv.analysisSpeed;
    await anVideo.play().catch(()=>{});

    let lastSampleTime = -1;
    const minBuffer = ()=>Math.min(state.adv.minBuffer, pbVideo.duration||state.adv.minBuffer);

    function step(){
      if(!state.analyzing) return;
      if(anVideo.ended){
        finishAnalysis();
        return;
      }
      const t = anVideo.currentTime;
      if(t - lastSampleTime > 0.02){
        lastSampleTime = t;
        
        createImageBitmap(anVideo, { resizeWidth: 3, resizeHeight: 3 }).then(bmp => {
          const now = performance.now();
          const requestPlan = (now - lastPlanRecompute > 120);
          if (requestPlan) lastPlanRecompute = now;
          
          analysisWorker.postMessage({
            type: 'sample',
            bmp: bmp,
            t: t,
            requestPlan: requestPlan
          }, [bmp]);
        }).catch(() => {});
        
        state.frontier = t;

        if(state.buffering && t >= minBuffer()){
          unlockPlayback();
        }
      }
      state.rafId = requestAnimationFrame(step);
    }
    state.rafId = requestAnimationFrame(step);
  }

  function unlockPlayback(){
    state.buffering = false;
    state.planReady = true;
    analysisOverlay.classList.add('hidden');
    [restartBtn, backBtn, fwdBtn, fullscreenBtn].forEach(b=>b.disabled=false);
    playBtn.disabled = false;
    seekBar.disabled = false;
    updateText(planStatus, 'Planning live');
    renderStaticFrame();
    drawPlayhead(pbVideo.currentTime||0);
  }

  function finishAnalysis(){
    cancelAnimationFrame(state.rafId);
    state.analyzing = false;
    anVideo.pause();
    anVideo.playbackRate = 1;
    analysisWorker.postMessage({ type: 'finish' });
  }

  function waitForSeek(v){
    return new Promise(res=>{
      let resolved = false;
      const h = ()=>{
        if (resolved) return;
        resolved = true;
        v.removeEventListener('seeked', h);
        res();
      };
      v.addEventListener('seeked', h);
      setTimeout(h, 400); 
    });
  }

  function gainAt(t){
    const times = state.curveTimes;
    const gains = state.curveGains;
    const lumas = state.curveLumas;
    const len = times.length;
    if(len === 0) return {gain:1, rawLuma:state.targetLuma};
    let idx = state.curveIdx;
    if(idx>=len) idx = len-1;
    while(idx < len-1 && times[idx+1] < t) idx++;
    while(idx > 0 && times[idx] > t) idx--;
    state.curveIdx = idx;
    const nextIdx = Math.min(idx+1, len-1);
    const t0 = times[idx], t1 = times[nextIdx];
    const g0 = gains[idx], g1 = gains[nextIdx];
    const l0 = lumas[idx], l1 = lumas[nextIdx];
    if(idx===nextIdx || t1===t0) return {gain:g0, rawLuma:l0};
    const f = Math.min(1, Math.max(0, (t-t0)/(t1-t0)));
    return { gain: g0 + (g1-g0)*f, rawLuma: l0 + (l1-l0)*f };
  }

  function contrastFactorOf(sliderVal){
    const c = sliderVal * 2.55;
    return (259*(c+255)) / (255*(259-c));
  }
  function contrastFormula255(v, sliderVal){
    return contrastFactorOf(sliderVal)*(v-128) + 128;
  }

  function buildLUT(totalGain, contrastSlider){
    const lut = state.lut;
    const s2l = state.srgbToLinearLUT;
    for(let i=0;i<256;i++){
      let lin = s2l[i] * totalGain;
      lin = Math.min(1, Math.max(0, lin));
      let v = linearToSrgb(lin) * 255;
      v = contrastFormula255(v, contrastSlider);
      lut[i] = Math.min(255, Math.max(0, v));
    }
  }

  // ---------------------------------------------------------------
  // WEBGL NATIVE-RESOLUTION PATH
  // ---------------------------------------------------------------
  let gl=null, glProgram=null, glTex=null, glUniforms={};
  let rbFBO=null, rbTex=null; const RB_SIZE=8;
  let prevFrameTex=null, prevFrameValid=false;
  let glBuf=null, glVs=null, glFs=null;
  let lutTex=null;

  function disposeGLResources() {
    if (!gl) return;
    if (glTex) { gl.deleteTexture(glTex); glTex = null; }
    if (prevFrameTex) { gl.deleteTexture(prevFrameTex); prevFrameTex = null; }
    if (rbTex) { gl.deleteTexture(rbTex); rbTex = null; }
    if (lutTex) { gl.deleteTexture(lutTex); lutTex = null; }
    if (rbFBO) { gl.deleteFramebuffer(rbFBO); rbFBO = null; }
    if (glBuf) { gl.deleteBuffer(glBuf); glBuf = null; }
    if (glVs) { gl.deleteShader(glVs); glVs = null; }
    if (glFs) { gl.deleteShader(glFs); glFs = null; }
    if (glProgram) { gl.deleteProgram(glProgram); glProgram = null; }
  }

  function initGL(forceReinit = false){
    if(gl && !forceReinit) return true;
    if(!gl) {
      gl = glCanvas.getContext('webgl', {preserveDrawingBuffer:false}) || glCanvas.getContext('experimental-webgl');
      if(!gl) return false;
    }

    const vsSrc = `
      attribute vec2 aPos;
      varying vec2 vUv;
      uniform vec2 uQuadScale;
      void main(){
        vUv = aPos*0.5 + 0.5;
        vUv.y = 1.0 - vUv.y;
        gl_Position = vec4(aPos*uQuadScale, 0.0, 1.0);
      }`;
    const fsSrc = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D uVideo;
      uniform sampler2D uPrevFrame;
      uniform sampler2D uLUT;
      uniform float uSaturation;
      uniform float uSharpness;
      uniform float uBlur;
      uniform vec2 uTexel;
      uniform float uSpatialStrength;
      uniform float uTemporalStrength;
      uniform float uSigma;
      
      uniform float uAddNoiseAmount;
      uniform float uAddNoiseScale;
      uniform float uAddNoiseTime;

      vec3 grade(vec3 c){
        float r = texture2D(uLUT, vec2(c.r, 0.5)).r;
        float g = texture2D(uLUT, vec2(c.g, 0.5)).r;
        float b = texture2D(uLUT, vec2(c.b, 0.5)).r;
        vec3 outc = vec3(r, g, b);
        
        float luma = dot(outc, vec3(0.2126, 0.7152, 0.0722));
        outc = luma + (outc - luma) * uSaturation;
        return clamp(outc, 0.0, 1.0);
      }

      void main(){
        vec3 c4 = grade(texture2D(uVideo, vUv).rgb);
        vec3 result = c4;

        bool needs3x3 = uSpatialStrength > 0.001 || uBlur > 0.001 || uSharpness > 0.001;

        if(needs3x3){
          vec3 c0 = grade(texture2D(uVideo, vUv + vec2(-1.0,-1.0)*uTexel).rgb);
          vec3 c1 = grade(texture2D(uVideo, vUv + vec2( 0.0,-1.0)*uTexel).rgb);
          vec3 c2 = grade(texture2D(uVideo, vUv + vec2( 1.0,-1.0)*uTexel).rgb);
          vec3 c3 = grade(texture2D(uVideo, vUv + vec2(-1.0, 0.0)*uTexel).rgb);
          vec3 c5 = grade(texture2D(uVideo, vUv + vec2( 1.0, 0.0)*uTexel).rgb);
          vec3 c6 = grade(texture2D(uVideo, vUv + vec2(-1.0, 1.0)*uTexel).rgb);
          vec3 c7 = grade(texture2D(uVideo, vUv + vec2( 0.0, 1.0)*uTexel).rgb);
          vec3 c8 = grade(texture2D(uVideo, vUv + vec2( 1.0, 1.0)*uTexel).rgb);
          vec3 mean = (c0+c1+c2+c3+c4+c5+c6+c7+c8) / 9.0;
          
          if(uSpatialStrength > 0.001){
            vec3 d0=c0-mean, d1=c1-mean, d2=c2-mean, d3=c3-mean, d4=c4-mean;
            vec3 d5=c5-mean, d6=c6-mean, d7=c7-mean, d8=c8-mean;
            float variance = (dot(d0,d0)+dot(d1,d1)+dot(d2,d2)+dot(d3,d3)+dot(d4,d4)+dot(d5,d5)+dot(d6,d6)+dot(d7,d7)+dot(d8,d8)) / 9.0;
            float localStd = sqrt(variance / 3.0);
            float thresh = uSigma * 0.06;
            float edge = smoothstep(thresh, thresh * 2.5, localStd);
            result = mix(result, mean, uSpatialStrength * (1.0 - edge));
          }

          if(uBlur > 0.001){
            result = mix(result, mean, uBlur);
          }
          if(uSharpness > 0.001){
            result = result + (result - mean) * uSharpness;
            result = clamp(result, 0.0, 1.0);
          }
        }

        if(uTemporalStrength > 0.001){
          vec3 prev = texture2D(uPrevFrame, vUv).rgb;
          float diff = distance(result, prev);
          float thresh = uSigma * 0.05;
          float motion = smoothstep(thresh, thresh * 3.0, diff);
          result = mix(result, prev, uTemporalStrength * (1.0 - motion));
        }

        if(uAddNoiseAmount > 0.001){
          vec2 pixelCoord = vUv / uTexel;
          vec2 p = floor(pixelCoord / uAddNoiseScale);
          float n = fract(sin(dot(p, vec2(12.9898, 78.233)) + uAddNoiseTime) * 43758.5453) - 0.5;
          result += n * uAddNoiseAmount;
          result = clamp(result, 0.0, 1.0);
        }

        gl_FragColor = vec4(result, 1.0);
      }`;

    function compile(type, src){
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    }
    glVs = compile(gl.VERTEX_SHADER, vsSrc);
    glFs = compile(gl.FRAGMENT_SHADER, fsSrc);
    glProgram = gl.createProgram();
    gl.attachShader(glProgram, glVs); gl.attachShader(glProgram, glFs); gl.linkProgram(glProgram);
    gl.useProgram(glProgram);

    const quad = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    glBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(glProgram, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    glTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, glTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    glUniforms.uLUT = gl.getUniformLocation(glProgram, 'uLUT');
    glUniforms.uSaturation = gl.getUniformLocation(glProgram, 'uSaturation');
    glUniforms.uSharpness = gl.getUniformLocation(glProgram, 'uSharpness');
    glUniforms.uBlur = gl.getUniformLocation(glProgram, 'uBlur');
    glUniforms.uVideo = gl.getUniformLocation(glProgram, 'uVideo');
    glUniforms.uPrevFrame = gl.getUniformLocation(glProgram, 'uPrevFrame');
    glUniforms.uTexel = gl.getUniformLocation(glProgram, 'uTexel');
    glUniforms.uSpatialStrength = gl.getUniformLocation(glProgram, 'uSpatialStrength');
    glUniforms.uTemporalStrength = gl.getUniformLocation(glProgram, 'uTemporalStrength');
    glUniforms.uSigma = gl.getUniformLocation(glProgram, 'uSigma');
    glUniforms.uQuadScale = gl.getUniformLocation(glProgram, 'uQuadScale');
    
    glUniforms.uAddNoiseAmount = gl.getUniformLocation(glProgram, 'uAddNoiseAmount');
    glUniforms.uAddNoiseScale = gl.getUniformLocation(glProgram, 'uAddNoiseScale');
    glUniforms.uAddNoiseTime = gl.getUniformLocation(glProgram, 'uAddNoiseTime');

    lutTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, lutTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    rbTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, rbTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, RB_SIZE, RB_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    rbFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, rbFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rbTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    prevFrameTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, prevFrameTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    if (!forceReinit) {
      resizeCanvases();
    } else {
      gl.viewport(0,0,glCanvas.width, glCanvas.height);
      ensurePrevFrameTex();
    }
    return true;
  }

  function ensurePrevFrameTex(){
    if(!gl || !prevFrameTex) return;
    gl.bindTexture(gl.TEXTURE_2D, prevFrameTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, Math.max(1,glCanvas.width), Math.max(1,glCanvas.height), 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    prevFrameValid = false;
  }

  function letterboxScale(vw, vh, cw, ch){
    const videoAspect = vw/vh, canvasAspect = cw/ch;
    let scaleX = 1, scaleY = 1;
    if(videoAspect > canvasAspect) scaleY = canvasAspect/videoAspect;
    else scaleX = videoAspect/canvasAspect;
    return {scaleX, scaleY};
  }

  function renderFrameGPU(satFactor){
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0,0,glCanvas.width, glCanvas.height);
    gl.useProgram(glProgram);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, glTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pbVideo);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, prevFrameTex);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, lutTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 256, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, state.lut);

    const vw = pbVideo.videoWidth||16, vh = pbVideo.videoHeight||9;
    const {scaleX, scaleY} = letterboxScale(vw, vh, glCanvas.width, glCanvas.height);

    gl.uniform1i(glUniforms.uVideo, 0);
    gl.uniform1i(glUniforms.uPrevFrame, 1);
    gl.uniform1i(glUniforms.uLUT, 2);
    gl.uniform1f(glUniforms.uSaturation, satFactor);
    gl.uniform1f(glUniforms.uSharpness, state.adjust.sharpness / 25.0);
    gl.uniform1f(glUniforms.uBlur, state.adjust.blur / 100.0);
    gl.uniform2f(glUniforms.uTexel, 1/Math.max(1,vw), 1/Math.max(1,vh));
    gl.uniform1f(glUniforms.uSpatialStrength, state.noise.enabled ? state.noise.spatial : 0.0);
    gl.uniform1f(glUniforms.uTemporalStrength, (state.noise.enabled && prevFrameValid) ? state.noise.temporal : 0.0);
    gl.uniform1f(glUniforms.uSigma, state.noise.sigma);
    gl.uniform2f(glUniforms.uQuadScale, scaleX, scaleY);
    
    gl.uniform1f(glUniforms.uAddNoiseAmount, state.addNoise.enabled ? (state.addNoise.amount / 100.0) : 0.0);
    gl.uniform1f(glUniforms.uAddNoiseScale, state.addNoise.scale);
    gl.uniform1f(glUniforms.uAddNoiseTime, state.addNoise.time);

    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, prevFrameTex);
    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, glCanvas.width, glCanvas.height, 0);
    prevFrameValid = true;
  }

  let lastGpuReadback = 0;
  function maybeReadbackGPULuma(){
    const now = performance.now();
    if(now - lastGpuReadback < 150) return;
    lastGpuReadback = now;
    gl.bindFramebuffer(gl.FRAMEBUFFER, rbFBO);
    gl.viewport(0,0,RB_SIZE,RB_SIZE);
    gl.uniform2f(glUniforms.uQuadScale, 1, 1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); 
    const px = new Uint8Array(RB_SIZE*RB_SIZE*4);
    gl.readPixels(0,0,RB_SIZE,RB_SIZE, gl.RGBA, gl.UNSIGNED_BYTE, px);
    let sum=0;
    for(let i=0;i<px.length;i+=4) sum += (0.2126*px[i] + 0.7152*px[i+1] + 0.0722*px[i+2]);
    state.lastResultLuma = (sum/255)/(RB_SIZE*RB_SIZE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0,0,glCanvas.width, glCanvas.height);
  }

  // ---------------------------------------------------------------
  // Unified render dispatcher
  // ---------------------------------------------------------------
  function computeGainAndFactors(t){
    let plannedGain = 1, rawLuma = state.targetLuma;
    if(state.expPlanning.enabled && state.planReady && state.curveTimes && state.curveTimes.length){
      const g = gainAt(t);
      plannedGain = g.gain; rawLuma = g.rawLuma;
    }
    const userExpFactor = Math.pow(2, state.adjust.exposure);
    const totalGain = plannedGain * userExpFactor;
    const satFactor = 1 + (state.adjust.saturation/100);
    return {plannedGain, rawLuma, totalGain, satFactor};
  }

  function createOffscreenCanvas(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') {
      return new OffscreenCanvas(w, h);
    } else {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      return c;
    }
  }

  let offscreenCpuCanvas = null;
  let offscreenCtx = null;

  function renderFrame(force = false){
    const t = pbVideo.currentTime;
    if (!force && t === lastRenderedTime) return;
    lastRenderedTime = t;

    if (!pbVideo.paused) {
      state.addNoise.time = (state.addNoise.time + (state.addNoise.temporal / 100)) % 4000000000;
    }

    const {plannedGain, rawLuma, totalGain, satFactor} = computeGainAndFactors(t);

    // Build LUT for both CPU and GPU paths
    buildLUT(totalGain, state.adjust.contrast);

    if(state.engine === 'gpu' && gl){
      renderFrameGPU(satFactor);
      maybeReadbackGPULuma();
    } else {
      if(cpuCanvas.width < 2) return;
      const w = cpuCanvas.width, h = cpuCanvas.height;
      
      if (!offscreenCpuCanvas || offscreenCpuCanvas.width !== w || offscreenCpuCanvas.height !== h) {
        offscreenCpuCanvas = createOffscreenCanvas(w, h);
        offscreenCtx = offscreenCpuCanvas.getContext('2d', {willReadFrequently: true});
      }
      
      const vw = pbVideo.videoWidth||w, vh = pbVideo.videoHeight||h;
      const videoAspect = vw/vh, canvasAspect = w/h;
      let dw, dh, dx, dy;
      if(videoAspect > canvasAspect){ dw = w; dh = w/videoAspect; dx = 0; dy = (h-dh)/2; }
      else { dh = h; dw = h*videoAspect; dy = 0; dx = (w-dw)/2; }
      
      offscreenCtx.fillStyle = '#000';
      offscreenCtx.fillRect(0,0,w,h);
      offscreenCtx.drawImage(pbVideo, dx, dy, dw, dh);
      
      if(!cpuFrameBuf || cpuFrameBuf.w!==w || cpuFrameBuf.h!==h){
        cpuFrameBuf = { w, h, prev:null, spatialSrc:null };
      }
      
      const imgData = offscreenCtx.getImageData(0,0,w,h);
      const d = imgData.data;
      const lut = state.lut;
      const total = d.length;
      for(let i=0;i<total;i+=4){
        let r = lut[d[i]], g = lut[d[i+1]], b = lut[d[i+2]];
        if(satFactor !== 1){
          const ly = 0.2126*r + 0.7152*g + 0.0722*b;
          r = ly + (r-ly)*satFactor; g = ly + (g-ly)*satFactor; b = ly + (b-ly)*satFactor;
          r = r<0?0:r>255?255:r; g = g<0?0:g>255?255:g; b = b<0?0:b>255?255:b;
        }
        d[i]=r; d[i+1]=g; d[i+2]=b;
      }
      
      if(state.noise.enabled) cpuApplyNoiseReduction(d, w, h, state.noise.spatial, state.noise.temporal, state.noise.sigma);
      
      if(state.adjust.blur > 0 || state.adjust.sharpness > 0){
        cpuApplyBlurSharpness(d, w, h, state.adjust.blur / 100, state.adjust.sharpness / 25);
      }

      if(state.addNoise.enabled) {
        cpuApplyAddNoise(d, w, h, state.addNoise.amount / 100, state.addNoise.scale, state.addNoise.time);
      }

      const rx0 = Math.max(0, Math.round(dx)), ry0 = Math.max(0, Math.round(dy));
      const rx1 = Math.min(w, Math.round(dx+dw)), ry1 = Math.min(h, Math.round(dy+dh));
      let lumaSum = 0, lumaCount = 0;
      for(let y=ry0; y<ry1; y++){
        let i = (y*w+rx0)*4;
        for(let x=rx0; x<rx1; x++, i+=4){
          lumaSum += (0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2]);
          lumaCount++;
        }
      }
      
      offscreenCtx.putImageData(imgData, 0, 0);
      octx.drawImage(offscreenCpuCanvas, 0, 0);
      
      state.lastResultLuma = lumaCount>0 ? (lumaSum/255)/lumaCount : 0;
    }

    state.lastRawLuma = rawLuma;
    state.lastGain = plannedGain;
    updateReadouts(t, force);
  }

  // ---------------------------------------------------------------
  // CPU Convolution passes
  // ---------------------------------------------------------------
  const noiseLUT = new Float32Array(65536);
  for(let i=0; i<65536; i++) noiseLUT[i] = Math.random() - 0.5;

  function cpuApplyAddNoise(d, w, h, amount, scale, timeOffset) {
    if (amount <= 0.001) return;
    const amt = amount * 255;
    const tHash = Math.floor(timeOffset) & 0xFFFF;
    
    if (scale <= 1.0) {
      let idx = (tHash * 331) & 0xFFFF;
      for(let i=0; i<d.length; i+=4) {
        const n = noiseLUT[idx] * amt;
        idx = (idx + 1) & 0xFFFF;
        d[i]   = d[i]   + n; if(d[i]<0) d[i]=0; else if(d[i]>255) d[i]=255;
        d[i+1] = d[i+1] + n; if(d[i+1]<0) d[i+1]=0; else if(d[i+1]>255) d[i+1]=255;
        d[i+2] = d[i+2] + n; if(d[i+2]<0) d[i+2]=0; else if(d[i+2]>255) d[i+2]=255;
      }
    } else {
      for(let y=0; y<h; y++) {
        const sy = Math.floor(y / scale);
        const rowHash = (sy * 19349663) ^ tHash;
        for(let x=0; x<w; x++) {
          const sx = Math.floor(x / scale);
          const hash = (sx * 73856093 ^ rowHash) & 0xFFFF;
          const n = noiseLUT[hash] * amt;
          const i = (y * w + x) * 4;
          d[i]   = d[i]   + n; if(d[i]<0) d[i]=0; else if(d[i]>255) d[i]=255;
          d[i+1] = d[i+1] + n; if(d[i+1]<0) d[i+1]=0; else if(d[i+1]>255) d[i+1]=255;
          d[i+2] = d[i+2] + n; if(d[i+2]<0) d[i+2]=0; else if(d[i+2]>255) d[i+2]=255;
        }
      }
    }
  }

  function cpuApplyNoiseReduction(d, w, h, spatialStrength, temporalStrength, sigma){
    if(spatialStrength > 0.001){
      if(!cpuFrameBuf.spatialSrc || cpuFrameBuf.spatialSrc.length !== d.length){
        cpuFrameBuf.spatialSrc = new Uint8ClampedArray(d.length);
      }
      const src = cpuFrameBuf.spatialSrc;
      src.set(d);
      const threshLo = sigma*15, threshHi = sigma*38;
      const threshDiff = threshHi - threshLo;
      for(let y=0;y<h;y++){
        const yUp = y>0?y-1:0, yDn = y<h-1?y+1:h-1;
        const r0 = yUp*w, r1 = y*w, r2 = yDn*w;
        for(let x=0;x<w;x++){
          const xL = x>0?x-1:0, xR = x<w-1?x+1:w-1;
          
          const j00 = (r0+xL)<<2, j01 = (r0+x)<<2, j02 = (r0+xR)<<2;
          const j10 = (r1+xL)<<2, j11 = (r1+x)<<2, j12 = (r1+xR)<<2;
          const j20 = (r2+xL)<<2, j21 = (r2+x)<<2, j22 = (r2+xR)<<2;
          
          const rSum = src[j00] + src[j01] + src[j02] + src[j10] + src[j11] + src[j12] + src[j20] + src[j21] + src[j22];
          const gSum = src[j00+1] + src[j01+1] + src[j02+1] + src[j10+1] + src[j11+1] + src[j12+1] + src[j20+1] + src[j21+1] + src[j22+1];
          const bSum = src[j00+2] + src[j01+2] + src[j02+2] + src[j10+2] + src[j11+2] + src[j12+2] + src[j20+2] + src[j21+2] + src[j22+2];
          
          const mr = rSum * 0.1111111111111111;
          const mg = gSum * 0.1111111111111111;
          const mb = bSum * 0.1111111111111111;
          
          let varSum = 0;
          let dr = src[j00]-mr, dg = src[j00+1]-mg, db = src[j00+2]-mb; varSum += dr*dr+dg*dg+db*db;
          dr = src[j01]-mr; dg = src[j01+1]-mg; db = src[j01+2]-mb; varSum += dr*dr+dg*dg+db*db;
          dr = src[j02]-mr; dg = src[j02+1]-mg; db = src[j02+2]-mb; varSum += dr*dr+dg*dg+db*db;
          dr = src[j10]-mr; dg = src[j10+1]-mg; db = src[j10+2]-mb; varSum += dr*dr+dg*dg+db*db;
          dr = src[j11]-mr; dg = src[j11+1]-mg; db = src[j11+2]-mb; varSum += dr*dr+dg*dg+db*db;
          dr = src[j12]-mr; dg = src[j12+1]-mg; db = src[j12+2]-mb; varSum += dr*dr+dg*dg+db*db;
          dr = src[j20]-mr; dg = src[j20+1]-mg; db = src[j20+2]-mb; varSum += dr*dr+dg*dg+db*db;
          dr = src[j21]-mr; dg = src[j21+1]-mg; db = src[j21+2]-mb; varSum += dr*dr+dg*dg+db*db;
          dr = src[j22]-mr; dg = src[j22+1]-mg; db = src[j22+2]-mb; varSum += dr*dr+dg*dg+db*db;
          
          const std = Math.sqrt(varSum * 0.037037037037037035);
          let edge = (std-threshLo)/threshDiff;
          edge = edge<0?0:edge>1?1:edge;
          const blend = spatialStrength*(1-edge);
          
          const i = (r1+x)<<2;
          d[i]   += (mr-d[i])*blend;
          d[i+1] += (mg-d[i+1])*blend;
          d[i+2] += (mb-d[i+2])*blend;
        }
      }
    }
    if(temporalStrength > 0.001 && cpuFrameBuf.prev && cpuFrameBuf.prev.length===d.length){
      const prev = cpuFrameBuf.prev;
      const threshLo = sigma*13, threshHi = sigma*40;
      const threshDiff = threshHi - threshLo;
      for(let i=0;i<d.length;i+=4){
        const dr=d[i]-prev[i], dg=d[i+1]-prev[i+1], db=d[i+2]-prev[i+2];
        const diff = Math.sqrt(dr*dr+dg*dg+db*db);
        let motion = (diff-threshLo)/threshDiff;
        motion = motion<0?0:motion>1?1:motion;
        const blend = temporalStrength*(1-motion);
        d[i]   += (prev[i]-d[i])*blend;
        d[i+1] += (prev[i+1]-d[i+1])*blend;
        d[i+2] += (prev[i+2]-d[i+2])*blend;
      }
    }
    if(!cpuFrameBuf.prev || cpuFrameBuf.prev.length !== d.length){
      cpuFrameBuf.prev = new Uint8ClampedArray(d.length);
    }
    cpuFrameBuf.prev.set(d);
  }

  function cpuApplyBlurSharpness(d, w, h, blur, sharp){
    if(!cpuFrameBuf.spatialSrc || cpuFrameBuf.spatialSrc.length !== d.length){
      cpuFrameBuf.spatialSrc = new Uint8ClampedArray(d.length);
    }
    const src = cpuFrameBuf.spatialSrc;
    src.set(d); 
    for(let y=0; y<h; y++){
      const yUp = y>0?y-1:0, yDn = y<h-1?y+1:h-1;
      const r0 = yUp*w, r1 = y*w, r2 = yDn*w;
      for(let x=0; x<w; x++){
        const xL = x>0?x-1:0, xR = x<w-1?x+1:w-1;
        
        const j00 = (r0+xL)<<2, j01 = (r0+x)<<2, j02 = (r0+xR)<<2;
        const j10 = (r1+xL)<<2, j11 = (r1+x)<<2, j12 = (r1+xR)<<2;
        const j20 = (r2+xL)<<2, j21 = (r2+x)<<2, j22 = (r2+xR)<<2;
        
        const rSum = src[j00] + src[j01] + src[j02] + src[j10] + src[j11] + src[j12] + src[j20] + src[j21] + src[j22];
        const gSum = src[j00+1] + src[j01+1] + src[j02+1] + src[j10+1] + src[j11+1] + src[j12+1] + src[j20+1] + src[j21+1] + src[j22+1];
        const bSum = src[j00+2] + src[j01+2] + src[j02+2] + src[j10+2] + src[j11+2] + src[j12+2] + src[j20+2] + src[j21+2] + src[j22+2];
        
        const mr = rSum * 0.1111111111111111;
        const mg = gSum * 0.1111111111111111;
        const mb = bSum * 0.1111111111111111;
        
        const i = (r1+x)<<2;
        let r=d[i], g=d[i+1], b=d[i+2];
        
        if(blur > 0.001){
          r += (mr - r)*blur;
          g += (mg - g)*blur;
          b += (mb - b)*blur;
        }
        if(sharp > 0.001){
          r += (r - mr)*sharp;
          g += (g - mg)*sharp;
          b += (b - mb)*sharp;
        }
        
        d[i]=r<0?0:r>255?255:r; 
        d[i+1]=g<0?0:g>255?255:g; 
        d[i+2]=b<0?0:b>255?255:b;
      }
    }
  }

  let lastUiUpdate = 0;
  let lastGraphUpdate = 0;
  let lastGraphT = -1;

  function updateReadouts(t, forceGraph = false){
    const now = performance.now();
    updateText(curTimeLabel, fmtTime(t));
    
    const newSeekVal = Math.floor(t*1000);
    if(!seekBar.matches(':active') && Number(seekBar.value) !== newSeekVal) {
      seekBar.value = newSeekVal;
    }
    
    if(now - lastUiUpdate > 100){
      lastUiUpdate = now;
      updateText(rawLumaVal, state.lastRawLuma.toFixed(3));
      updateText(resultLumaVal, state.lastResultLuma.toFixed(3));
      updateText(curGainVal, state.lastGain.toFixed(3)+'×');
    }

    const needsGraphRedraw = forceGraph || Math.abs(t - lastGraphT) >= 0.1 || (now - lastGraphUpdate > 500);
    if(needsGraphRedraw && !(state.perf.reduceUI && state.analyzing)){
      lastGraphUpdate = now;
      lastGraphT = t;
      drawPlayhead(t);
    }
  }

  function renderStaticFrame(){ requestAnimationFrame(()=>renderFrame(true)); }

  // ---------------------------------------------------------------
  // Dynamically managed Rendering Loop Lifecycle
  // ---------------------------------------------------------------
  function startPlaybackLoop() {
    if (playbackLoopRunning) return;
    playbackLoopRunning = true;
    
    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      const vfcLoop = () => {
        if (!playbackLoopRunning) return;
        if (state.hasVideo && !pbVideo.paused && !pbVideo.ended) { renderFrame(); }
        pbVideo.requestVideoFrameCallback(vfcLoop);
      };
      pbVideo.requestVideoFrameCallback(vfcLoop);
    } else {
      const loop = () => {
        if (!playbackLoopRunning) return;
        if (state.hasVideo && !pbVideo.paused && !pbVideo.ended) { renderFrame(); }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  // ---------------------------------------------------------------
  // Transport controls
  // ---------------------------------------------------------------
  function updatePlayIcon(){
    const playing = !pbVideo.paused && !pbVideo.ended;
    playIcon.style.display = playing ? 'none' : 'block';
    pauseIcon.style.display = playing ? 'block' : 'none';
    playBtn.title = playing ? 'Pause' : 'Play';
  }
  
  playBtn.addEventListener('click', ()=>{
    if(pbVideo.paused){ pbVideo.currentTime -= 1; renderStaticFrame(); pbVideo.play(); pbVideo.currentTime -= 1; renderStaticFrame(); } else { renderStaticFrame(); pbVideo.pause(); pbVideo.currentTime -= 1;  renderStaticFrame(); }
  });
  
  pbVideo.addEventListener('play', ()=>{
    updatePlayIcon();
    startPlaybackLoop();
  });
  pbVideo.addEventListener('pause', ()=>{
    playbackLoopRunning = false;
    updatePlayIcon();
    renderFrame(true);
  });
  pbVideo.addEventListener('ended', ()=>{
    playbackLoopRunning = false;
    updatePlayIcon();
  });

  restartBtn.addEventListener('click', ()=>{ pbVideo.currentTime=0; renderStaticFrame(); });
  backBtn.addEventListener('click', ()=>{ pbVideo.currentTime = Math.max(0, pbVideo.currentTime-10); renderStaticFrame(); });
  fwdBtn.addEventListener('click', ()=>{ pbVideo.currentTime = Math.min(pbVideo.duration||0, pbVideo.currentTime+10); renderStaticFrame(); });

  seekBar.addEventListener('input', ()=>{
    const t = parseFloat(seekBar.value)/1000;
    pbVideo.currentTime = t;
    if(pbVideo.paused) renderStaticFrame();
  });

  fullscreenBtn.addEventListener('click', ()=>{
    if(stage.requestFullscreen) stage.requestFullscreen();
    else if(stage.webkitRequestFullscreen) stage.webkitRequestFullscreen();
  });

  pbVideo.addEventListener('loadeddata', ()=>{
    if(state.engine === 'gpu') initGL(); 
    emptyState.style.display = 'none';
    cpuCanvas.style.display = state.engine==='cpu' ? 'block' : 'none';
    glCanvas.style.display = state.engine==='gpu' ? 'block' : 'none';
    if(!state.expPlanning.enabled){
      enablePlaybackControls();
      updateText(planStatus, 'Exposure planning disabled — playing raw');
    }
    pbVideo.playbackRate = state.adjust.playbackSpeed; 
    renderStaticFrame();
  });

  // ---------------------------------------------------------------
  // Curve graph
  // ---------------------------------------------------------------
  let graphCacheCanvas = document.createElement('canvas');
  let graphCacheCtx = graphCacheCanvas.getContext('2d');
  let graphCacheValid = false;

  function drawEmptyGraph(){
    const w = curveCanvas.width, h = curveCanvas.height;
    gctx.clearRect(0,0,w,h);
    gctx.fillStyle = '#1b1e24';
    gctx.fillRect(0,0,w,h);
    graphCacheValid = false;
  }

  function drawPlayhead(t){
    const times = state.curveTimes;
    const lumas = state.curveLumas;
    const gains = state.curveGains;
    const len = times ? times.length : 0;
    if(!len) return;
    
    const w = curveCanvas.width, h = curveCanvas.height, pad = 28;
    const duration = pbVideo.duration || times[len-1] || 1;
    function xOf(tt){ return pad + (w-2*pad) * (tt/duration); }
    function yOfLuma(v){ return pad + (h-2*pad) * (1 - Math.min(1,Math.max(0,v))); }
    const gMin = state.adv.gainMin, gMax = state.adv.gainMax;
    function yOfGain(g){ const norm = (g-gMin)/(gMax-gMin); return pad + (h-2*pad)*(1-Math.min(1,Math.max(0,norm))); }

    if (graphCacheCanvas.width !== w || graphCacheCanvas.height !== h) {
      graphCacheCanvas.width = w;
      graphCacheCanvas.height = h;
      graphCacheValid = false;
    }

    if (!graphCacheValid) {
      graphCacheCtx.clearRect(0,0,w,h);
      graphCacheCtx.fillStyle = '#1b1e24';
      graphCacheCtx.fillRect(0,0,w,h);
      graphCacheCtx.strokeStyle = '#262b34';
      graphCacheCtx.lineWidth = 1;
      for(let i=0;i<=4;i++){
        const y = pad + (h-2*pad)*i/4;
        graphCacheCtx.beginPath(); graphCacheCtx.moveTo(pad,y); graphCacheCtx.lineTo(w-pad,y); graphCacheCtx.stroke();
      }
      
      graphCacheCtx.strokeStyle = '#5c6270';
      graphCacheCtx.setLineDash([4,4]);
      graphCacheCtx.beginPath();
      const ty = yOfLuma(state.targetLuma);
      graphCacheCtx.moveTo(pad,ty); graphCacheCtx.lineTo(w-pad,ty);
      graphCacheCtx.stroke();
      graphCacheCtx.setLineDash([]);

      graphCacheCtx.strokeStyle = '#5eead4';
      graphCacheCtx.lineWidth = 1.4;
      graphCacheCtx.beginPath();
      for(let i=0; i<len; i++){
        const x = xOf(times[i]), y = yOfLuma(lumas[i]);
        if(i===0) graphCacheCtx.moveTo(x,y); else graphCacheCtx.lineTo(x,y);
      }
      graphCacheCtx.stroke();

      graphCacheCtx.strokeStyle = '#ffb000';
      graphCacheCtx.lineWidth = 1.8;
      graphCacheCtx.shadowColor = '#ffb000'; graphCacheCtx.shadowBlur = 4;
      graphCacheCtx.beginPath();
      for(let i=0; i<len; i++){
        const x = xOf(times[i]), y = yOfGain(gains[i]);
        if(i===0) graphCacheCtx.moveTo(x,y); else graphCacheCtx.lineTo(x,y);
      }
      graphCacheCtx.stroke();
      graphCacheCtx.shadowBlur = 0;

      graphCacheCtx.fillStyle = '#5c6270';
      graphCacheCtx.font = '11px JetBrains Mono, monospace';
      graphCacheCtx.fillText('1.0', 4, pad+4);
      graphCacheCtx.fillText('0.0', 4, h-pad+4);
      graphCacheCtx.fillText(fmtTime(0), pad, h-8);
      graphCacheCtx.fillText(fmtTime(duration), w-pad-30, h-8);

      graphCacheValid = true;
    }

    gctx.clearRect(0,0,w,h);
    gctx.drawImage(graphCacheCanvas, 0, 0);

    if(state.frontier < duration && !state.planComplete){
      const fx = xOf(state.frontier);
      gctx.fillStyle = 'rgba(0,0,0,0.35)';
      gctx.fillRect(fx, pad, (w-pad)-fx, h-2*pad);
    }

    const px = xOf(t);
    gctx.strokeStyle = 'rgba(232,230,225,0.55)';
    gctx.lineWidth = 1;
    gctx.beginPath(); gctx.moveTo(px, pad); gctx.lineTo(px, h-pad); gctx.stroke();
    gctx.fillStyle = '#e8e6e1';
    gctx.beginPath(); gctx.arc(px, pad, 3, 0, Math.PI*2); gctx.fill();
  }

  drawEmptyGraph();
})();