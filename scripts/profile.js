import { database } from "./firebaseConfig.js";
import { ref, get, child } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getCurrentUser } from "./firebaseConfig.js";

async function loadProfile() {
    const currentUser = getCurrentUser();

    // Проверка, авторизован ли пользователь
    // if (!currentUser) {
    //     window.location.href = "./index.html"; // Перенаправление на страницу входа, если пользователь не авторизован
    //     return;
    // }

    const userInfoContainer = document.getElementById("user-info");
    const completedSurveysContainer = document.getElementById("completed-surveys-list");
    const pendingSurveysContainer = document.getElementById("pending-surveys-list");

    // Отображаем имя пользователя
    userInfoContainer.querySelector("#username").textContent = currentUser.nickname || "Без имени";

    try {
        const surveysRef = ref(database, `surveys/${currentUser.uid}`);
        const snapshot = await get(surveysRef);

        if (snapshot.exists()) {
            const surveys = snapshot.val();
            const completedSurveys = [];
            const pendingSurveys = [];

            // Разделяем опросы на пройденные и непроизведенные
            for (const surveyId in surveys) {
                const survey = surveys[surveyId];
                const responsesRef = ref(database, `surveys/${currentUser.uid}/${surveyId}/responses`);
                const responsesSnapshot = await get(responsesRef);

                if (responsesSnapshot.exists()) {
                    completedSurveys.push(survey.title);
                } else {
                    pendingSurveys.push(survey.title);
                }
            }

            // Отображаем пройденные опросы
            completedSurveys.forEach((surveyTitle) => {
                const li = document.createElement("li");
                li.textContent = surveyTitle;
                completedSurveysContainer.appendChild(li);
            });

            // Отображаем непроизведенные опросы
            pendingSurveys.forEach((surveyTitle) => {
                const li = document.createElement("li");
                li.textContent = surveyTitle;
                pendingSurveysContainer.appendChild(li);
            });
        } else {
            userInfoContainer.innerHTML = "<p>Нет опросов.</p>";
        }
    } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
    }
}

document.getElementById("completed-surveys").addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("completed-surveys").classList.toggle("open");
});

document.getElementById("pending-surveys").addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("pending-surveys").classList.toggle("open");
});

loadProfile();
