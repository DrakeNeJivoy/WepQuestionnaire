import { database } from "./firebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getCurrentUser } from "./auth.js";
const spinner = document.getElementById("loading-spinner");

function showSpinner() {
spinner.style.display = "flex";
}

function hideSpinner() {
    spinner.style.display = "none";
}

// Загрузка всех опросов
async function loadSurveys() {
    showSpinner();
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
                        <button class="view-survey" data-user-id="${userId}" data-survey-id="${surveyId}">
                            Посмотреть опрос
                        </button>
                    `;

                    // Добавляем кнопку для статистики только для опросов текущего пользователя
                    const currentUser = getCurrentUser();
                    if (currentUser && survey.creator === currentUser.uid) {
                        surveyCard.innerHTML += `
                            <button class="view-stats" data-user-id="${userId}" data-survey-id="${surveyId}">
                                Статистика
                            </button>
                        `;
                    }

                    surveysContainer.appendChild(surveyCard);
                });
            });

            // Назначаем обработчики событий
            document.querySelectorAll(".view-survey").forEach((button) => {
                button.addEventListener("click", (event) => {
                    const userId = button.dataset.userId;
                    const surveyId = button.dataset.surveyId;
                    viewSurvey(userId, surveyId);
                });
            });

            document.querySelectorAll(".view-stats").forEach((button) => {
                button.addEventListener("click", (event) => {
                    const userId = button.dataset.userId;
                    const surveyId = button.dataset.surveyId;
                    viewStats(userId, surveyId);
                });
            });
        } else {
            surveysContainer.innerHTML = "<p>Опросы не найдены.</p>";
        }
    } catch (error) {
        console.error("Ошибка загрузки опросов:", error);
        surveysContainer.innerHTML = "<p>Ошибка при загрузке опросов.</p>";
    }
    finally {
        hideSpinner(); // Скрываем спиннер после загрузки
    }
}

// Функция для открытия страницы с опросом
function viewSurvey(userId, surveyId) {
    location.href = `survey.html?userId=${userId}&surveyId=${surveyId}`;
}

function viewStats(userId, surveyId) {
    location.href = `status.html?userId=${userId}&surveyId=${surveyId}`;
}

// Инициализация
document.addEventListener("DOMContentLoaded", loadSurveys);
