// Импортируем необходимые модули из firebaseConfig.js
import { auth, database } from "./firebaseConfig.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

let currentUser = null;

// Слушаем изменения состояния аутентификации
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("Logged in as:", user.email);
    } else {
        currentUser = null;
        console.log("User not logged in");
    }
});

// Экспортируем функцию для получения текущего пользователя
export const getCurrentUser = () => currentUser;

// Логика для страницы логина
document.getElementById("login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("logemail").value;
    const password = document.getElementById("logpassword").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Logged in successfully!");
        window.location.href = "./dashboard.html";
    } catch (error) {
        console.error("Login error:", error);
        alert(`Error: ${error.message}`);
    }
});

// Логика для страницы регистрации
document.getElementById("register-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("regemail").value;
    const password = document.getElementById("regpassword").value;
    const nickname = document.getElementById("username").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userRef = ref(database, `users/${user.uid}`);
        await set(userRef, {
            email: user.email,
            nickname: nickname,
            registeredAt: new Date().toISOString(),
        });
        alert("Registration successful! You can now log in.");

        window.location.href = "./index.html";
    } catch (error) {
        console.error("Registration error:", error);
        alert(`Error: ${error.message}`);
    }
});

// Пример функции для записи данных в Firebase Realtime Database
export async function saveSurveyToDatabase(surveyId, surveyData) {
    if (currentUser) {
        const surveyRef = ref(database, 'surveys/' + surveyId);
        try {
            await set(surveyRef, surveyData);
            console.log("Survey saved successfully");
        } catch (error) {
            console.error("Error saving survey:", error);
        }
    } else {
        console.error("No user logged in, cannot save survey");
    }
}

// Пример функции для получения данных из Firebase Realtime Database
export async function getSurveyFromDatabase(surveyId) {
    const surveyRef = ref(database, 'surveys/' + surveyId);
    try {
        const snapshot = await get(surveyRef);
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log("No data available");
            return null;
        }
    } catch (error) {
        console.error("Error fetching survey:", error);
        return null;
    }
}
