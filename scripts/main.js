import { database } from "./firebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getCurrentUser } from "./auth.js";

// Загрузка всех опросов
async function loadSurveys() {
    const surveysContainer = document.querySelector(".survey-list");

    try {
        const snapshot = await get(ref(database, "surveys")); // Загружаем все опросы
        if (snapshot.exists()) {
            const allSurveys = snapshot.val();
            surveysContainer.innerHTML = ""; // Очищаем контейнер перед добавлением опросов

            Object.entries(allSurveys).forEach(([userId, userSurveys]) => {
                Object.entries(userSurveys).forEach(([surveyId, survey]) => {
                    const surveyCard = document.createElement("div");
                    surveyCard.className = "survey-card";
                    surveyCard.innerHTML = `
                        <h3>${survey.title}</h3>
                        <button onclick="viewSurvey('${userId}', '${surveyId}')">Посмотреть опрос</button>
                    `;

                    // Добавляем кнопку для статистики только для опросов текущего пользователя
                    const currentUser = getCurrentUser();
                    if (currentUser && survey.creator === currentUser.uid) {
                        surveyCard.innerHTML += `
                            <button onclick="viewStats('${userId}', '${surveyId}')">Статистика</button>
                        `;
                    }

                    surveysContainer.appendChild(surveyCard);
                });
            });
        } else {
            surveysContainer.innerHTML = "<p>Опросы не найдены.</p>";
        }
    } catch (error) {
        console.error("Ошибка загрузки опросов:", error);
        surveysContainer.innerHTML = "<p>Ошибка при загрузке опросов.</p>";
    }
}

// Инициализация
document.addEventListener("DOMContentLoaded", loadSurveys);
