// Firebase импорт SDK
import { database } from "./firebaseConfig.js";
import { ref, get, child, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getCurrentUser } from "./firebaseConfig.js";
    const spinner = document.getElementById("loading-spinner");

    function showSpinner() {
    spinner.style.display = "flex";
    }

    function hideSpinner() {
        spinner.style.display = "none";
    }
// Загрузка опроса
async function loadSurvey(userId, surveyId) {
    showSpinner();

    const surveyContainer = document.querySelector(".questions-container");

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
                        ${[1, 2, 3, 4, 5].map(
                            (value) => `
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
            submitButton.addEventListener("click", async (event) => {
                event.preventDefault(); // Останавливает отправку формы по умолчанию
                console.log("Submitting survey...");
                try {
                    await submitSurvey(userId, surveyId);
                    alert("Ответы успешно сохранены!");
                    window.location.href = "./dashboard.html";
                    console.log("Survey submitted successfully");
                } catch (error) {
                    console.error("Ошибка при сохранении ответов:", error);
                    alert("Не удалось сохранить ответы.");
                }
            });           
            surveyContainer.appendChild(submitButton);
        } else {
            surveyContainer.innerHTML = "<p>Опрос не найден.</p>";
        }
    } catch (error) {
        console.error("Ошибка загрузки опроса:", error);
        surveyContainer.innerHTML = "<p>Ошибка загрузки опроса.</p>";
    }
    finally {
        hideSpinner(); // Скрываем спиннер после загрузки
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
    document.querySelectorAll(".questions-container input:checked").forEach((input) => {
        const questionIndex = input.name.split("-")[1];
        responses[questionIndex] = parseInt(input.value, 10);
    });

    const responseData = {
        answers: responses,
        submittedAt: new Date().toISOString(),
    };

    try {
        // Сохранение ответов в `users/completedTests`
        //const userResponsesRef = ref(database, `users/${currentUser.uid}/completedTests/${surveyId}`);
        //await update(userResponsesRef, responseData);

        // Сохранение ответов в `surveys/{userId}/{surveyId}/responses`
        const surveyResponsesRef = ref(database, `surveys/${userId}/${surveyId}/responses/${currentUser.uid}`);
        await update(surveyResponsesRef, responseData);

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
