// Firebase импорт SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCbjARF2xMiaszm8ImoBE21sGIN3hBOALw",
    authDomain: "webproject-f2b8d.firebaseapp.com",
    projectId: "webproject-f2b8d",
    storageBucket: "webproject-f2b8d.appspot.com",
    messagingSenderId: "957727699660",
    appId: "1:957727699660:web:228ef947dd133ee2dc0869",
    measurementId: "G-HQPX1JPWRF",
    databaseURL: "https://webproject-f2b8d-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

let currentUser = null;

// Слушаем изменения состояния аутентификации
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user; // Сохраняем текущего пользователя
        console.log("Logged in as:", user.email);
    } else {
        currentUser = null;
        console.log("User not logged in");
    }
});

// Функция для получения текущего пользователя
export const getCurrentUser = () => currentUser;

// Экспорт необходимых модулей
export { auth, database };
