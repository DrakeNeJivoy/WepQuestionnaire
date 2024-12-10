import { database } from "./firebaseConfig.js";
import { ref, get, remove } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getCurrentUser } from "./auth.js";

async function waitForUser() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const user = getCurrentUser();
            if (user) {
                clearInterval(interval);
                console.log("Пользователь найден:", user);
                resolve(user);
            }
        }, 100);
    });
}

async function loadProfile() {
    const currentUser = await waitForUser();

    if (!currentUser || !currentUser.uid) {
        console.error("Пользователь не авторизован.");
        const userInfoContainer = document.getElementById("user-info");
        userInfoContainer.innerHTML = "<p>Вы не авторизованы. Пожалуйста, войдите в систему.</p>";
        return;
    }

    console.log("Пользователь авторизован:", currentUser.email);

    try {
        const userInfoContainer = document.getElementById("user-info");
        const createdSurveysContainer = document.getElementById("created-surveys-list");
        const completedSurveysContainer = document.getElementById("completed-surveys-list");

        // Получение никнейма пользователя
        const userRef = ref(database, `users/${currentUser.uid}/nickname`);
        const nicknameSnapshot = await get(userRef);

        const nickname = nicknameSnapshot.exists() ? nicknameSnapshot.val() : "Без имени";
        userInfoContainer.querySelector("#username").textContent = nickname;
        console.log("Никнейм пользователя:", nickname);

        // Загрузка созданных опросов
        const createdSurveysRef = ref(database, `surveys/${currentUser.uid}`);
        const createdSurveysSnapshot = await get(createdSurveysRef);

        if (createdSurveysSnapshot.exists()) {
            const createdSurveys = createdSurveysSnapshot.val();
            createdSurveysContainer.innerHTML = ""; // Очищаем перед загрузкой
            console.log("Загруженные созданные опросы:", createdSurveys);

            Object.entries(createdSurveys).forEach(([surveyId, survey]) => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <span>${survey.title}</span>
                    <button class="view-survey" data-survey-id="${surveyId}">Посмотреть</button>
                    <button class="view-stats" data-survey-id="${surveyId}">Статистика</button>
                    <button class="delete-survey" data-survey-id="${surveyId}">Удалить</button>
                `;
                createdSurveysContainer.appendChild(li);
            });

            // Назначаем обработчики для кнопок
            document.querySelectorAll("#created-surveys-list .view-survey").forEach((button) => {
                button.addEventListener("click", (event) => {
                    const surveyId = button.dataset.surveyId;
                    console.log("Открытие опроса с ID:", surveyId);
                    viewSurvey(currentUser.uid, surveyId);
                });
            });

            document.querySelectorAll("#created-surveys-list .view-stats").forEach((button) => {
                button.addEventListener("click", (event) => {
                    const surveyId = button.dataset.surveyId;
                    console.log("Открытие статистики для опроса с ID:", surveyId);
                    viewStats(currentUser.uid, surveyId);
                });
            });

            document.querySelectorAll("#created-surveys-list .delete-survey").forEach((button) => {
                button.addEventListener("click", async (event) => {
                    const surveyId = button.dataset.surveyId;
                    console.log("Удаление опроса с ID:", surveyId);
                    await deleteSurvey(currentUser.uid, surveyId);
                    button.parentElement.remove(); // Удаляем элемент из DOM
                });
            });
        } else {
            createdSurveysContainer.innerHTML = "<p>Вы еще не создали ни одного опроса.</p>";
            console.log("Пользователь не создал опросы.");
        }

        // Загрузка пройденных опросов
        const allSurveysRef = ref(database, `surveys`);
        const allSurveysSnapshot = await get(allSurveysRef);

        if (allSurveysSnapshot.exists()) {
            const allSurveys = allSurveysSnapshot.val();
            completedSurveysContainer.innerHTML = ""; // Очищаем перед загрузкой
            console.log("Загруженные все опросы:", allSurveys);

            let completedFound = false;

            for (const [creatorId, surveys] of Object.entries(allSurveys)) {
                for (const [surveyId, survey] of Object.entries(surveys)) {
                    const responsesRef = ref(database, `surveys/${creatorId}/${surveyId}/responses`);
                    const responsesSnapshot = await get(responsesRef);

                    if (responsesSnapshot.exists() && responsesSnapshot.val()[currentUser.uid]) {
                        completedFound = true;
                        const li = document.createElement("li");
                        li.innerHTML = `
                            <span>${survey.title}</span>
                            <button class="view-survey" data-creator-id="${creatorId}" data-survey-id="${surveyId}">Посмотреть</button>
                        `;
                        completedSurveysContainer.appendChild(li);

                        document.querySelectorAll("#completed-surveys-list .view-survey").forEach((button) => {
                            button.addEventListener("click", (event) => {
                                const creatorId = button.dataset.creatorId;
                                const surveyId = button.dataset.surveyId;
                                console.log("Открытие опроса с ID:", surveyId, "создатель ID:", creatorId);
                                viewSurvey(creatorId, surveyId);
                            });
                        });
                    }
                }
            }

            if (!completedFound) {
                completedSurveysContainer.innerHTML = "<p>Вы еще не прошли ни одного опроса.</p>";
                console.log("Пользователь не прошел ни одного опроса.");
            }
        } else {
            completedSurveysContainer.innerHTML = "<p>Вы еще не прошли ни одного опроса.</p>";
            console.log("Нет доступных опросов.");
        }
    } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
    }
}

async function deleteSurvey(userId, surveyId) {
    try {
        const surveyRef = ref(database, `surveys/${userId}/${surveyId}`);
        await remove(surveyRef);
        console.log(`Опрос с ID ${surveyId} удален.`);
        alert("Опрос успешно удален.");
    } catch (error) {
        console.error("Ошибка при удалении опроса:", error);
        alert("Не удалось удалить опрос.");
    }
}

function viewSurvey(userId, surveyId) {
    console.log("Перенаправление на страницу опроса. UserId:", userId, "SurveyId:", surveyId);
    location.href = `survey.html?userId=${userId}&surveyId=${surveyId}`;
}

function viewStats(userId, surveyId) {
    console.log("Перенаправление на страницу статистики. UserId:", userId, "SurveyId:", surveyId);
    location.href = `status.html?userId=${userId}&surveyId=${surveyId}`;
}

// Запускаем загрузку профиля
loadProfile();
