// Firebase импорт SDK
import { database, auth } from "./firebaseConfig.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getCurrentUser } from "./auth.js";

// Добавление новой строки для вопроса
document.getElementById("addQuestion")?.addEventListener("click", () => {
    const questionsContainer = document.querySelector(".questions-container");
    const newQuestion = document.createElement("input");
    newQuestion.type = "text";
    newQuestion.placeholder = "Введите вопрос";
    newQuestion.className = "question";
    questionsContainer.appendChild(newQuestion);
});

// Сохранение опроса
document.getElementById("submit")?.addEventListener("click", async () => {
    alert("Нажал на кнопку");
    const title = document.getElementById("title").value;
    const questionInputs = document.querySelectorAll(".questions-container .question");
    const questions = Array.from(questionInputs).map((input) => input.value);

    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert("Вы должны быть авторизованы для создания опроса.");
        return;
    }

    const surveyData = {
        title,
        questions,
        creator: currentUser.uid,
        responses: {} // Инициализация пустого объекта для ответов
    };

    try {
        const surveysRef = ref(database, `surveys/${currentUser.uid}`);
        const newSurveyRef = push(surveysRef);
        await set(newSurveyRef, surveyData);
        alert("Опрос успешно создан!");
    } catch (error) {
        console.error("Ошибка при создании опроса:", error);
        alert("Не удалось сохранить опрос.");
    }
});
