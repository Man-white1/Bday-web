// 🎵 Auto-Play Music Player — 3 Songs
const musicList = [
  "music1.mp3",  // Song 1
  "music2.mp3",  // Song 2
  "music3.mp3"   // Song 3
];

let currentTrack = 0;
let isPlaying = true;

// Create audio element
const audio = document.createElement("audio");
audio.preload = "auto";
audio.src = musicList[currentTrack];
audio.volume = 0.8; // adjust volume: 0.0 = quiet, 1.0 = loudest

// Auto-play when page loads
document.addEventListener("DOMContentLoaded", () => {
  audio.play().catch(err => {
    console.log("Click to play first — browser safety:", err);
    isPlaying = false;
  });
});

// Auto-play NEXT song when one ends
audio.addEventListener("ended", () => {
  currentTrack++;
  if (currentTrack >= musicList.length) {
    currentTrack = 0; // loop back to first song
  }
  audio.src = musicList[currentTrack];
  audio.play();
});

// Optional: Show button to pause/play
const musicBtn = document.createElement("button");
musicBtn.id = "playMusicBtn";
musicBtn.className = "music-btn";
musicBtn.textContent = "🔊 Playing...";
document.body.appendChild(musicBtn);

musicBtn.addEventListener("click", () => {
  if (isPlaying) {
    audio.pause();
    musicBtn.textContent = "🎵 Play Music";
    isPlaying = false;
  } else {
    audio.play();
    musicBtn.textContent = "🔊 Playing...";
    isPlaying = true;
  }
});