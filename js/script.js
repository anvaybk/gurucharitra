// script.js
// Install the application via button
// Register the service worker
// Code added in index.html

// Handle the installation prompt
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

// Check if the app is installed and adjust the button visibility
window.addEventListener('appinstalled', (evt) => {
  installBtn.style.display = 'none';
  alert('App is already installed');
});

// Show the install button if the app is not installed
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Check if the app is already installed
  if (!navigator.standalone && !window.matchMedia('(display-mode: standalone)').matches) {
    installBtn.style.display = 'block';
  }
});

installBtn.addEventListener('click', () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((result) => {
      if (result.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  }
});

// Functions
function startReading() {
    window.location.href = 'chapters.html';
}

function goToChapter(chapterUrl) {
    window.location.href = chapterUrl;
}

function goToHome() {
   // window.location.href = 'home.html';
   // window.location.href = '../index.html';
	  window.location.href = '../chapters.html';
}

function goToHomePage() {
     window.location.href = 'index.html';
}
