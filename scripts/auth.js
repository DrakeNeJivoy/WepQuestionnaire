// Firebase импорт SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCbjARF2xMiaszm8ImoBE21sGIN3hBOALw",
    authDomain: "webproject-f2b8d.firebaseapp.com",
    projectId: "webproject-f2b8d",
    storageBucket: "webproject-f2b8d.appspot.com",
    messagingSenderId: "957727699660",
    appId: "1:957727699660:web:228ef947dd133ee2dc0869",
    measurementId: "G-HQPX1JPWRF",
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Логика для страницы логина
document.getElementById("login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // Аутентификация через Firebase
        await signInWithEmailAndPassword(auth, email, password);
        alert("Logged in successfully!");
        window.location.href = "./dashboard.html"; // Переход на страницу Dashboard
    } catch (error) {
        console.error("Login error:", error);
        alert(`Error: ${error.message}`);
    }
});

// Логика для страницы регистрации
document.getElementById("register-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // Создание нового пользователя через Firebase
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Registration successful! You can now log in.");
        window.location.href = "./index.html"; // Переход на страницу логина
    } catch (error) {
        console.error("Registration error:", error);
        alert(`Error: ${error.message}`);
    }
});
