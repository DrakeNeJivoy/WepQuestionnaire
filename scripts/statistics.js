// Firebase импорт SDK
import { database } from "./firebaseConfig.js";
import { ref, get, child } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
const spinner = document.getElementById("loading-spinner");

function showSpinner() {
    spinner.style.display = "flex";
}

function hideSpinner() {
    spinner.style.display = "none";
}

// Функция загрузки статистики
async function loadStatistics(userId, surveyId) {
    const statisticsContainer = document.querySelector(".statistics-container");

    try {
        showSpinner();
        const surveyRef = child(ref(database), `surveys/${userId}/${surveyId}`);
        const surveySnapshot = await get(surveyRef);

        if (surveySnapshot.exists()) {
            const surveyData = surveySnapshot.val();
            const responsesRef = child(ref(database), `surveys/${userId}/${surveyId}/responses`);
            const responsesSnapshot = await get(responsesRef);

            if (responsesSnapshot.exists()) {
                const responses = responsesSnapshot.val();
                const stats = calculateStatistics(responses);
                displayStatistics(surveyData.questions, stats, statisticsContainer);
            } else {
                statisticsContainer.innerHTML = "<p>Ответы на этот опрос отсутствуют.</p>";
            }
        } else {
            statisticsContainer.innerHTML = "<p>Опрос не найден.</p>";
        }
    } catch (error) {
        console.error("Ошибка загрузки статистики:", error);
        statisticsContainer.innerHTML = "<p>Ошибка при загрузке статистики.</p>";
    }
    finally {
        hideSpinner();
    }
}

// Расчет процентного соотношения ответов
function calculateStatistics(responses) {
    const stats = {};

    // Обрабатываем каждый ответ
    Object.values(responses).forEach((userResponse) => {
        userResponse.answers.forEach((answer, questionIndex) => {
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
function displayStatistics(questions, stats, container) {
    container.innerHTML = "";
    Object.entries(stats).forEach(([questionIndex, answers]) => {
        const questionBlock = document.createElement("div");

        // Отображаем сам вопрос
        const questionText = document.createElement("h4");
        questionText.textContent = `Вопрос: ${questions[questionIndex]}`;
        questionBlock.appendChild(questionText);

        // Создание контейнера для диаграммы и текста с ответами
        const statsRow = document.createElement("div");
        statsRow.style.display = 'flex';  // Выстраиваем все элементы в один ряд
        statsRow.style.alignItems = 'center'; // Выравниваем элементы по вертикали

        // Подготовка данных для диаграммы
        const labels = Object.keys(answers);
        const data = Object.values(answers);

        // Создаем canvas для диаграммы
        const chartCanvas = document.createElement("canvas");
        chartCanvas.width = 300;  // Уменьшаем размер диаграммы
        chartCanvas.height = 150; // Уменьшаем размер диаграммы
        statsRow.appendChild(chartCanvas);

        // Создание диаграммы с помощью Chart.js (круговая диаграмма)
        new Chart(chartCanvas, {
            type: 'pie',
            data: {
                labels: labels.map((label) => `Ответ ${label}`),
                datasets: [{
                    label: 'Процент ответов',
                    data: data,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)', 
                        'rgba(255, 159, 64, 0.2)', 
                        'rgba(153, 102, 255, 0.2)', 
                        'rgba(255, 99, 132, 0.2)', 
                        'rgba(54, 162, 235, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)', 
                        'rgba(255, 159, 64, 1)', 
                        'rgba(153, 102, 255, 1)', 
                        'rgba(255, 99, 132, 1)', 
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return `${tooltipItem.label}: ${tooltipItem.raw}%`;
                            }
                        }
                    }
                }
            }
        });

        // Создаем блок для ответов
        const answersBlock = document.createElement("div");
        answersBlock.style.marginLeft = '40px';  // Отступ между диаграммой и текстом с ответами
        Object.entries(answers).forEach(([answer, percentage]) => {
            const answerLine = document.createElement("p");
            answerLine.textContent = `Ответ ${answer}: ${percentage}%`;
            answersBlock.appendChild(answerLine);
        });

        // Добавляем блок с ответами и диаграмму в родительский элемент
        statsRow.appendChild(answersBlock);
        questionBlock.appendChild(statsRow);
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
