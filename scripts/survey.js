// Firebase импорт SDK
import { database } from "./firebaseConfig.js";
import { ref, get, child, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getCurrentUser } from "./firebaseConfig.js";

// Загрузка опроса
async function loadSurvey(userId, surveyId) {
    const surveyContainer = document.querySelector(".survey-container");

    try {
        const surveyRef = child(ref(database), `surveys/${userId}/${surveyId}`);
        const snapshot = await get(surveyRef);
        if (snapshot.exists()) {
            const survey = snapshot.val();
            surveyContainer.innerHTML = `<h2>${survey.title}</h2>`;
            survey.questions.forEach((question, index) => {
                const questionElement = document.createElement("div");
                questionElement.innerHTML = `
                    <p>${question}</p>
                    <div>
                        ${[1, 2, 3, 4, 5].map((value) => `
                            <label>
                                <input type="radio" name="question-${index}" value="${value}" />
                                ${value}
                            </label>
                        `).join("")}
                    </div>
                `;
                surveyContainer.appendChild(questionElement);
            });

            const submitButton = document.createElement("button");
            submitButton.textContent = "Отправить";
            submitButton.addEventListener("click", () => submitSurvey(userId, surveyId));
            surveyContainer.appendChild(submitButton);
        } else {
            surveyContainer.innerHTML = "<p>Опрос не найден.</p>";
        }
    } catch (error) {
        console.error("Ошибка загрузки опроса:", error);
        surveyContainer.innerHTML = "<p>Ошибка загрузки опроса.</p>";
    }
}

// Сохранение ответов
async function submitSurvey(userId, surveyId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert("Вы должны быть авторизованы для участия в опросе.");
        return;
    }

    const responses = {};
    document.querySelectorAll(".survey-container input:checked").forEach((input) => {
        const questionIndex = input.name.split("-")[1];
        responses[questionIndex] = parseInt(input.value, 10);
    });

    try {
        const responsesRef = ref(database, `responses/${surveyId}/${currentUser.uid}`);
        await update(responsesRef, responses);
        alert("Ответы успешно сохранены!");
    } catch (error) {
        console.error("Ошибка при сохранении ответов:", error);
        alert("Не удалось сохранить ответы.");
    }
}

// Использование функции `loadSurvey`
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("userId");
const surveyId = urlParams.get("surveyId");

if (userId && surveyId) {
    loadSurvey(userId, surveyId);
}
