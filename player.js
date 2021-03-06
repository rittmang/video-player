const videoContainer = document.querySelector('.video-container');
const video = document.querySelector('.video-container video');
const cjs = new Castjs({
  receiver:'CC1AD845',
  joinpolicy:'origin_scoped',
});
const controlsContainer = document.querySelector('.video-container .controls-container');
let elem=document.documentElement;

const playPauseButton = document.querySelector('.video-container .controls button.play-pause');
const rewindButton = document.querySelector('.video-container .controls button.rewind');
const fastForwardButton = document.querySelector('.video-container .controls button.fast-forward');
const volumeButton = document.querySelector('.video-container .controls button.volume');
const volumeTooltip = document.querySelector('.video-container .controls button.volume div');
const fullScreenButton = document.querySelector('.video-container .controls button.full-screen');
const playButton = playPauseButton.querySelector('.playing');
const pauseButton = playPauseButton.querySelector('.paused');
const fullVolumeButton = volumeButton.querySelector('.full-volume');
const mutedButton = volumeButton.querySelector('.muted');
const maximizeButton = fullScreenButton.querySelector('.maximize');
const minimizeButton = fullScreenButton.querySelector('.minimize');
const captionsButton = document.querySelector('.video-container .controls button.captions');
const captionsOn=captionsButton.querySelector('.captions-on');
const captionsOff=captionsButton.querySelector('.captions-off');
const castButton = document.querySelector('.video-container .controls button.cast .chromecast-icon');



const progressBar = document.querySelector('.video-container .progress-controls .progress-bar');
const watchedBar = document.querySelector('.video-container .progress-controls .progress-bar .watched-bar');
const timeLeft = document.querySelector('.video-container .progress-controls .time-remaining');

let controlsTimeout;
controlsContainer.style.opacity = '0';
watchedBar.style.width = '0px';
pauseButton.style.display = 'none';
minimizeButton.style.display = 'none';
captionsOn.style.display='';
captionsOff.style.display='none';

fullVolumeButton.style.display = '';
mutedButton.style.display = 'none';



var span = document.getElementById("subtitle");
var track = video.textTracks[0];
track.mode = 'hidden';
track.oncuechange = function(e) {
    var cue = this.activeCues[0];
    if (cue) {
        span.innerHTML = '';
        span.appendChild(cue.getCueAsHTML());
    }
    else{
      span.innerHTML = '';
    }
};


function updateMetadata(){
  navigator.mediaSession.metadata = new MediaMetadata({
    title:metadata.title,
    artist:"on ROR Movies",
    artwork:[{
      src:video.poster,sizes:'1280X720',type:'image/jpg'
    }]
  });
  updatePositionState();
}

function updatePositionState(){
  if('setPositionState' in navigator.mediaSession){
    console.log("Updating position state");
    navigator.mediaSession.setPositionState({
      duration:video.duration,
      playbackRate:video.playbackRate,
      position:video.currentTime
    });
  }
}
const displayControls = () => {
  controlsContainer.style.opacity = '1';
  document.body.style.cursor = 'initial';
  
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
  }
  controlsTimeout = setTimeout(() => {
    controlsContainer.style.opacity = '0';
    
    document.body.style.cursor = 'none';
    video.style.setProperty('line-height',10+'px')
  }, 5000);
};

const playPause = () => {
  if (video.paused && !cjs.connected) {
    video.play()
    .then(_=>updateMetadata())
    .catch(error=>console.log(error.message));
  }
  else if(!video.paused && !cjs.connected) {
    video.pause();
  }
  else if(cjs.paused && cjs.connected){
    cjs.play();
    playButton.style.display = 'none';
    pauseButton.style.display = '';
  }
  else if(!cjs.paused && cjs.connected){
    cjs.pause();
    playButton.style.display = '';
    pauseButton.style.display = 'none';
  }

};

const toggleCaptions = () => {
  if(video.textTracks[0]!=null && span.style.display==='none'){
      // video.textTracks[0].mode='showing';
      span.style.display='';
      console.log(span);
      captionsOn.style.display='';
      captionsOff.style.display='none';
    }
    else{
      span.style.display='none';
      console.log("Off subs");
      captionsOff.style.display='';
      captionsOn.style.display='none';
    }
   
  }
  
const toggleMute = () => {
  video.muted = !video.muted;
  if (video.muted) {
    fullVolumeButton.style.display = 'none';
    mutedButton.style.display = '';
    volumeTooltip.setAttribute('data-tooltip','Unmute (m)');
  } else {
    fullVolumeButton.style.display = '';
    mutedButton.style.display = 'none';
    volumeTooltip.setAttribute('data-tooltip','Mute (m)');
  }
};

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    // videoContainer.requestFullscreen();
    elem.requestFullscreen({navigationUI:"hide"});
  } else {
    document.exitFullscreen();
  }
};


document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    maximizeButton.style.display = '';
    minimizeButton.style.display = 'none';
  } else {
    maximizeButton.style.display = 'none';
    minimizeButton.style.display = '';
  }
});

document.addEventListener('keyup', (event) => {
  if (event.code === 'Space') {
    playPause(); 
  }

  if (event.code === 'KeyM') {
    toggleMute();
  }

  if (event.code === 'KeyF') {
    toggleFullScreen();
  }

  displayControls();
});

controlsContainer.addEventListener('mousehover',()=>{
  controlsContainer.style.opacity = '1';
  document.body.style.cursor = 'initial';
})

document.addEventListener('mousemove', () => {
  if(video.paused){
    controlsContainer.style.opacity = '1';
    document.body.style.cursor = 'initial';
  }
  else{
  displayControls();
  }
});



video.addEventListener('timeupdate', () => {
  
  watchedBar.style.width = ((video.currentTime / video.duration) * 100) + '%';
  var totalSecondsRemaining = video.duration - video.currentTime;

  const time = new Date(null);
  time.setSeconds(totalSecondsRemaining);
 
  var hours=Math.floor(totalSecondsRemaining/3600);
  totalSecondsRemaining=totalSecondsRemaining-hours*3600;

  var minutes=Math.floor(totalSecondsRemaining/60);
  var seconds=Math.trunc(totalSecondsRemaining-minutes*60);
  let minute = (minutes.toString().padStart('2', '0'));
  let second = (seconds.toString().padStart('2', '0'));
  if(hours > 0){
    timeLeft.textContent = `${hours ? hours : '00'}:${minute}:${second}`;
  }
  else{
    timeLeft.textContent = `${minute}:${second}`;
  }
  
});

video.addEventListener('play',()=>{
  playButton.style.display = 'none';
  pauseButton.style.display = '';

});
video.addEventListener('pause',()=>{
  playButton.style.display = '';
  pauseButton.style.display = 'none';
});

progressBar.addEventListener('click', (event) => {
  const pos = (event.pageX  - (progressBar.offsetLeft + progressBar.offsetParent.offsetLeft)) / progressBar.offsetWidth;
  video.currentTime = pos * video.duration;
});

playPauseButton.addEventListener('click', playPause);

rewindButton.addEventListener('click', () => {
  if(cjs.connected){
    var goback=cjs.time - 10;
    if(goback<1){
      goback=0;
    }
    cjs.seek(goback);
  }
  video.currentTime -= 10;
});

fastForwardButton.addEventListener('click', () => {
  if(cjs.connected){
    var goforward = cjs.time + 30;
    if(goforward >= cjs.duration){
      goforward = cjs.duration;
    }
    cjs.seek(goforward);
  }
  video.currentTime += 10;
});

volumeButton.addEventListener('click', toggleMute);

fullScreenButton.addEventListener('click', toggleFullScreen);

captionsButton.addEventListener('click',toggleCaptions);

castButton.addEventListener('click',()=>{
  if(cjs.available && !cjs.connected){
    console.log(cjs.time);
    video.pause();
    cjs.cast(video.getElementsByTagName("source")[0].src,metadata);
    var loadtime= cjs.time+Math.round(video.currentTime);
    cjs.seek(loadtime);
  }
  else if(cjs.connected){
    var ctime = cjs.time;
    cjs.disconnect();
    video.currentTime=ctime;
  }
});

cjs.on('available',()=>{
  console.log("Chromecast available");
});
cjs.on('connect',()=>{
  console.log("Connecting");
  castButton.classList.remove('off');
  castButton.classList.remove('on');
  castButton.classList.add('turning-on');//turning-on
});
cjs.on('disconnect',()=>{
  console.log("Disconnecting");
  castButton.classList.remove('on');
  castButton.classList.remove('turning-on');
  castButton.classList.add('off');
});
cjs.on('error',(err)=>{
  console.log('Error\t:'+err);
});
cjs.on('playing',()=>{
  castButton.classList.remove('turning-on');
  castButton.classList.remove('off');
  castButton.classList.add('on');
  playButton.style.display = 'none';
  pauseButton.style.display = '';
});
cjs.on('paused',()=>{
  playButton.style.display = '';
  pauseButton.style.display = 'none';
})

let defaultSkipTime=10;
navigator.mediaSession.setActionHandler('seekbackward', function(event) {
  console.log('> User clicked "Seek Backward" icon.');
  const skipTime = event.seekOffset || defaultSkipTime;
  video.currentTime = Math.max(video.currentTime - skipTime, 0);
  updatePositionState();
});

navigator.mediaSession.setActionHandler('seekforward', function(event) {
  console.log('> User clicked "Seek Forward" icon.');
  const skipTime = event.seekOffset || defaultSkipTime;
  video.currentTime = Math.min(video.currentTime + skipTime, video.duration);
  updatePositionState();
});

/* Play & Pause */

navigator.mediaSession.setActionHandler('play', async function() {
  console.log('> User clicked "Play" icon.');
  await video.play();
  navigator.mediaSession.playbackState = "playing";
  // Do something more than just playing video...
});

navigator.mediaSession.setActionHandler('pause', function() {
  console.log('> User clicked "Pause" icon.');
  video.pause();
  navigator.mediaSession.playbackState = "paused";
  // Do something more than just pausing video...
});
