// Firebase импорт SDK
import { database, auth } from "./firebaseConfig.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getCurrentUser } from "./auth.js";

// Добавление новой строки для вопроса
document.getElementById("addQuestion")?.addEventListener("click", (event) => {
    event.preventDefault();
    const questionsContainer = document.querySelector(".questions-container");

    // Создание обертки для нового вопроса
    const questionWrapper = document.createElement("div");
    questionWrapper.className = "question-wrapper";

    // Создание поля ввода для нового вопроса
    const newQuestion = document.createElement("input");
    newQuestion.type = "text";
    newQuestion.placeholder = "Введите вопрос";
    newQuestion.className = "question";

    // Создание кнопки удаления
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Удалить";
    deleteButton.className = "delete-question";

    // Обработчик удаления конкретного вопроса
    deleteButton.addEventListener("click", () => {
        event.preventDefault();
        questionsContainer.removeChild(questionWrapper);
    });

    // Добавление элементов в обертку
    questionWrapper.appendChild(newQuestion);
    questionWrapper.appendChild(deleteButton);

    // Добавление обертки в контейнер
    questionsContainer.appendChild(questionWrapper);
});

// Очистка всех полей кроме первого, а первого — очищение
document.getElementById("clearQuestions")?.addEventListener("click", (event) => {
    event.preventDefault();
    const questionsContainer = document.querySelector(".questions-container");
    const allWrappers = questionsContainer.querySelectorAll(".question-wrapper");

    if (allWrappers.length > 0) {
        // Оставляем первый элемент и очищаем его
        const firstWrapper = allWrappers[0];
        const firstInput = firstWrapper.querySelector(".question");
        firstInput.value = "";

        // Удаляем остальные
        allWrappers.forEach((wrapper, index) => {
            if (index > 0) {
                questionsContainer.removeChild(wrapper);
            }
        });
    }
});

// Сохранение опроса
document.getElementById("submit")?.addEventListener("click", async () => {
    //alert("Нажал на кнопку");
    const title = document.getElementById("title").value;
    const questionInputs = document.querySelectorAll(".questions-container .question");
    const questions = Array.from(questionInputs).map((input) => input.value);

    const currentUser = getCurrentUser();
    if (!currentUser) {
        //alert("Вы должны быть авторизованы для создания опроса.");
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
        //alert("Опрос успешно создан!");
    } catch (error) {
        console.error("Ошибка при создании опроса:", error);
        //alert("Не удалось сохранить опрос.");
    }

    const questionsContainer = document.querySelector(".questions-container");
    const allWrappers = questionsContainer.querySelectorAll(".question-wrapper");

    if (allWrappers.length > 0) {
        // Оставляем первый элемент и очищаем его
        const firstWrapper = allWrappers[0];
        const firstInput = firstWrapper.querySelector(".question");
        firstInput.value = "";

        // Удаляем остальные
        allWrappers.forEach((wrapper, index) => {
            if (index > 0) {
                questionsContainer.removeChild(wrapper);
            }
        });
    }
});
