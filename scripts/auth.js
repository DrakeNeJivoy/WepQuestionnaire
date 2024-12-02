
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCbjARF2xMiaszm8ImoBE21sGIN3hBOALw",
    authDomain: "webproject-f2b8d.firebaseapp.com",
    projectId: "webproject-f2b8d",
    storageBucket: "webproject-f2b8d.firebasestorage.app",
    messagingSenderId: "957727699660",
    appId: "1:957727699660:web:228ef947dd133ee2dc0869",
    measurementId: "G-HQPX1JPWRF"
  };

  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const sign = document.getElementById("email");
const pass = document.getElementById("password");
const form = document.querySelector("form");

form.addEventListener("submit" ,async(event) =>{
    event.preventDefault();
    const email = sign.value;
    const password = pass.value;

    try {
 
        await signInWithEmailAndPassword(auth, email, password);
        message.textContent = "Logged in successfully!";
        console.log("succes");
        window.location.href = "./dashboard.html";
    
      } catch (error) {
        message.textContent = error.message;
        console.log("pshelnah"); 
      }
    });


// document.getElementById("login-form").addEventListener("submit", function (event) {
//     event.preventDefault();


//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;

//     if (email && password) {

//         window.location.href = "./dashboard.html";
//     } else {
//         alert("Please fill in both fields.");
//     }
// });
