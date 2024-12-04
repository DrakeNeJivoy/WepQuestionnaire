// Firebase импорт SDK
import { database } from "./firebaseConfig.js";
import { ref, get, child } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Функция загрузки статистики
async function loadStatistics(userId, surveyId) {
    const statisticsContainer = document.querySelector(".statistics-container");

    try {
        const responsesRef = child(ref(database), `responses/${surveyId}`);
        const snapshot = await get(responsesRef);

        if (snapshot.exists()) {
            const responses = snapshot.val();
            const stats = calculateStatistics(responses);
            displayStatistics(stats, statisticsContainer);
        } else {
            statisticsContainer.innerHTML = "<p>Ответы на этот опрос отсутствуют.</p>";
        }
    } catch (error) {
        console.error("Ошибка загрузки статистики:", error);
        statisticsContainer.innerHTML = "<p>Ошибка при загрузке статистики.</p>";
    }
}

// Расчет процентного соотношения ответов
function calculateStatistics(responses) {
    const stats = {};
    Object.values(responses).forEach((userResponse) => {
        Object.entries(userResponse).forEach(([questionIndex, answer]) => {
            stats[questionIndex] = stats[questionIndex] || {};
            stats[questionIndex][answer] = (stats[questionIndex][answer] || 0) + 1;
        });
    });

    // Преобразование в проценты
    Object.keys(stats).forEach((questionIndex) => {
        const total = Object.values(stats[questionIndex]).reduce((sum, count) => sum + count, 0);
        Object.keys(stats[questionIndex]).forEach((answer) => {
            stats[questionIndex][answer] = ((stats[questionIndex][answer] / total) * 100).toFixed(2);
        });
    });

    return stats;
}

// Отображение статистики
function displayStatistics(stats, container) {
    container.innerHTML = "";
    Object.entries(stats).forEach(([questionIndex, answers]) => {
        const questionBlock = document.createElement("div");
        questionBlock.innerHTML = `<h4>Вопрос ${parseInt(questionIndex) + 1}</h4>`;
        Object.entries(answers).forEach(([answer, percentage]) => {
            const answerLine = document.createElement("p");
            answerLine.textContent = `Ответ ${answer}: ${percentage}%`;
            questionBlock.appendChild(answerLine);
        });
        container.appendChild(questionBlock);
    });
}

// Использование функции `loadStatistics`
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("userId");
const surveyId = urlParams.get("surveyId");

if (userId && surveyId) {
    loadStatistics(userId, surveyId);
}
