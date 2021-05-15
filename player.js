const videoContainer = document.querySelector('.video-container');
const video = document.querySelector('.video-container video');
const cjs = new Castjs();
const controlsContainer = document.querySelector('.video-container .controls-container');

const playPauseButton = document.querySelector('.video-container .controls button.play-pause');
const rewindButton = document.querySelector('.video-container .controls button.rewind');
const fastForwardButton = document.querySelector('.video-container .controls button.fast-forward');
const volumeButton = document.querySelector('.video-container .controls button.volume');
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

var track=video.textTracks[0];
var cue=track.cues[0];
if(typeof cue !== 'undefined'){
  cue.line=16;
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
  }, 1000);
};



const playPause = () => {
  if (video.paused && !cjs.connected) {
    video.play();
    playButton.style.display = 'none';
    pauseButton.style.display = '';
  }
  else if(!video.paused && !cjs.connected) {
    video.pause();
    playButton.style.display = '';
    pauseButton.style.display = 'none';
  }


};


const toggleCaptions = () => {
  if(video.textTracks[0]!=null && video.textTracks[0].mode!='showing'){
      video.textTracks[0].mode='showing';
      captionsOn.style.display='';
      captionsOff.style.display='none';
    }
    else{
      video.textTracks[0].mode='hidden';
      captionsOff.style.display='';
      captionsOn.style.display='none';
    }
   
  }
  

cjs.on('available',()=>{
    console.log("Chromecast available");
});
cjs.on('connect',()=>{
    console.log("Connecting");
    castButton.classList.remove('off');
    castButton.classList.add('turning-on');//turning-on
});
cjs.on('disconnect',()=>{
    console.log("Disconnecting");
    castButton.classList.remove('on');
    castButton.classList.add('off');
});
cjs.on('error',(err)=>{
    console.log('Error\t:'+err);
});
cjs.on('playing',()=>{
  castButton.classList.remove('turning-on');
  castButton.classList.add('on');

});

const toggleMute = () => {
  video.muted = !video.muted;
  if (video.muted) {
    fullVolumeButton.style.display = 'none';
    mutedButton.style.display = '';
  } else {
    fullVolumeButton.style.display = '';
    mutedButton.style.display = 'none';
  }
};

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    videoContainer.requestFullscreen();
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

document.addEventListener('mousemove', () => {
  displayControls();
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

  timeLeft.textContent = `${hours ? hours : '00'}:${minute}:${second}`;
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
  console.log(video.currentTime);
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

