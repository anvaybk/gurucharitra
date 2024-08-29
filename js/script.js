// script.js

// Functions
function startReading() {
    window.location.href = 'home.html';
     // window.location.href = 'chapters.html';
}

function goToChapter(chapterUrl) {
    window.location.href = chapterUrl;
}

function goToHome() {
   // window.location.href = '../home.html';
   // window.location.href = '../index.html';
      window.location.href = '../chapters.html';
}

function goToMainHome() {
    window.location.href = '../home.html';
   // window.location.href = '../index.html';
   //	  window.location.href = '../chapters.html';
}


function goToHomePage() {
     window.location.href = 'index.html';
}

function goToRegistrationHomePage() {
     window.location.href = '../registrations.html';
}


// Disable code for user activity
$("body").on("contextmenu", function (e)  
   {  
      return false;  
   });  

//Or,
document.oncontextmenu = function() {
   return false;
}

//Disable right-click menu on a particular section on the page,
$(document).ready(function(){  
   $("#youDivSectionId").bind("contextmenu", function(e) {  
      return false;  
   });  
}); 

//Disable Cut, copy, paste,
$(document).ready(function(){
   $('body').bind('cut copy paste', function (e)
   {
      e.preventDefault();
   });
});

//Let's Block the same cut, copy, paste events with javascript codes,
$(document).ready(function(){  
$(document).keydown(function(event) {  
   //event.ctrlKey = check ctrl key is press or not  
   //event.which = check for F7  
   // event.which =check for v key  
   if (event.ctrlKey==true && (event.which == '118' || event.which == '86')) {  
      event.preventDefault();  
      }  
   });  
}); 

//Prevent browser Debugger console example,
$(document).keydown(function (event) {
// Prevent F12 -
if (event.keyCode == 123) {
   return false;
}
// Prevent Ctrl+a = disable select all
// Prevent Ctrl+u = disable view page source
// Prevent Ctrl+s = disable save
if (event.ctrlKey && (event.keyCode === 85 || event.keyCode === 83 || event.keyCode ===65 )) {
   return false;
}
// Prevent Ctrl+Shift+I = disabled debugger console using keys open
else if (event.ctrlKey && event.shiftKey && event.keyCode === 73)
{
   return false;
}
//print disable by ctrl+p
else if(event.ctrlKey && event.keyCode===80){
 return false;
  }
});
