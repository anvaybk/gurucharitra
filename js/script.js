// script.js

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

// Handle the Install Prompt: Optionally, you can handle the install prompt with a custom event listener for a better user experience.

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the default prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Show your custom install button
  document.getElementById('install-button').style.display = 'block';
});

document.getElementById('install-button').addEventListener('click', () => {
  // Hide the custom install button
  document.getElementById('install-button').style.display = 'none';
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((result) => {
    if (result.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    deferredPrompt = null;
  });
});
