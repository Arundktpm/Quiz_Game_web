//global variables
const QuizContainer = document.getElementById("quiz");
const questionEl = document.getElementById("question");
const AnswerEl = document.querySelectorAll('input');
const Option_A = document.getElementById("a_text");
const Option_B = document.getElementById("b_text");
const Option_C = document.getElementById("c_text");
const Option_D = document.getElementById("d_text");
const SubmitEl = document.getElementById("submit");
const ModeEl = document.getElementById('Mode');
const timeElement = document.querySelector('.time');
let Escore = document.getElementById('Escore');
let Mscore = document.getElementById('Mscore');
let Hscore = document.getElementById('Hscore');
let LevelEl = document.getElementById("level");

//timeStamp
let timer = null;
let hours = 0;
let minutes = 0;
let seconds = 0;
function updateTimer() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
    }
    if (minutes >= 60) {
        minutes = 0;
        hours++;
    }
    const formattedTime = `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
    timeElement.textContent = formattedTime;
}
function timeinteval(pos) {
    if (pos == 1) {
        timer = setInterval(updateTimer, 1000);
    }
    if (pos == 20) {
        clearInterval(timer);
        timer = null;
    }
}

//overall function for Quiz
(function () {
    let currentQuestion = 0;
    let Score = 0;
    let questionData;
    // fetch question from API
    async function Getquestion(Difficulty) {
        Score = 0;
        currentQuestion = 0;
        // Remove 'loading' class from all elements that have it
        function Clrloading() {
            document.querySelectorAll('.loading').forEach(element => {
                element.classList.remove('loading');
            });
        }
        try {
            const data = await fetch(`https://opentdb.com/api.php?amount=20&category=18&difficulty=${Difficulty}&type=multiple&encode=base64`);
            const QuizData = await data.json();
            if (data.ok) {
                Clrloading();
            }
            if (!data.ok) {
                setTimeout(() => {
                    Clrloading();
                    QuizContainer.innerHTML = `<h3 class="errorMsg" >API Limitation Problem Please Refresh Webpage!</h3>  <button onclick="location.reload()" class="btn">Reload</button>`
                }, 3000)
            }

            return QuizData;
        }
        catch (e) {
            setTimeout(() => {
                Clrloading();
                QuizContainer.innerHTML = `<h3 class="errorMsg" >Fail to Fetch poor Internet Connection!</h3>`
            }, 3000)
            console.error("Error:", e);
        }

    }

    async function InitQuiz(Difficulty) {
        const QuizFetch = await Getquestion(Difficulty);
        questionData = QuizFetch.results;
        console.log("Question is Loaded From API!");
        LoadQuiz();
    }
    function LoadQuiz() {
        deselectAnswer();
        //data control from api
        let Quiz = questionData[currentQuestion];
        let QuizOptions = Quiz.incorrect_answers;
        let position = Math.round(Math.random() * 3);
        QuizOptions.splice(position, 0, Quiz.correct_answer);
        let [option1, option2, option3, option4] = QuizOptions;
        //load values in UI
        questionEl.innerHTML = `${currentQuestion + 1}. ${atob(Quiz.question)}`;
        Option_A.innerHTML = atob(option1);
        Option_B.innerHTML = atob(option2);
        Option_C.innerHTML = atob(option3);
        Option_D.innerHTML = atob(option4);
    }

    function deselectAnswer() {
        AnswerEl.forEach((answer) => {
            answer.checked = false;
            answer.disabled = false;
            answer.parentElement.classList.remove('correct-answer', 'wrong-answer');
        })
    }

    function GetSelected() {
        let Answer = null;
        const correctAnswer = questionData[currentQuestion].correct_answer.trim();
        // Get selected answer text
        AnswerEl.forEach((answer) => {
            if (answer.checked) {
                Answer = answer.nextElementSibling.textContent.trim();
            }
        });
        if (!Answer) return null;
        AnswerEl.forEach((answer) => {
            const optionText = btoa(answer.nextElementSibling.textContent.trim());
            if (answer.checked && optionText === correctAnswer) {
                answer.parentElement.classList.add('correct-answer');
            }
            else if (answer.checked && optionText !== correctAnswer) {
                answer.parentElement.classList.add('wrong-answer');
            }
            if (optionText === correctAnswer) {
                answer.parentElement.classList.add('correct-answer');
            }
            answer.disabled = true;
        });
        return Answer;
    }
    //input disable and wrong and right
    document.querySelector('ul').addEventListener('input', (ev) => {
        if (ev.target.tagName === 'LABEL' || ev.target.tagName === 'INPUT') {
            GetSelected();
        }
    });

    function handleQuiz() {
        let Answer = btoa(GetSelected());
        const correctAnswer = questionData[currentQuestion].correct_answer.trim();
        if (Answer === correctAnswer) {
            Score++;
        }
        currentQuestion++;
        timeinteval(currentQuestion);
        if (currentQuestion < questionData.length) {
            LoadQuiz();
        }
        else {
            HighScore(Score);
            QuizContainer.innerHTML = `<h1 class="text-slate-900 font-coinly text-2xl font-bold">Score</h1> 
            <h2 class="text-lg font-semibold text-white p-5">You answered ${Score}/${questionData.length} questions correctly</h2>
                    <button onclick="location.reload()" class="btn">Play Again</button>`
        }
    }
    SubmitEl.addEventListener("click", handleQuiz);
    //Startup for quiz
    function QuizStartup() {
        let Difficulty = localStorage.getItem('Difficulty');
        if (Difficulty !== null) {
            InitQuiz(Difficulty);
            //ui mode show 
            [...ModeEl.options].forEach((item) => {
                (item.value === Difficulty) ? item.selected = true : item.selected = false;
            });
        }
        else {
            InitQuiz("easy");
            localStorage.setItem("Difficulty", "easy");
        }
        //score and levels store 
        if (localStorage.getItem("HighScore")) {
            let getHighScore = JSON.parse(atob(localStorage.getItem("HighScore")));
            Escore.textContent = getHighScore.easy;
            Mscore.textContent = getHighScore.medium;
            Hscore.textContent = getHighScore.hard;
            LevelEl.textContent = getHighScore.level;
        }
    }
    document.addEventListener('DOMContentLoaded', QuizStartup);

    //score store function
    function HighScore(score) {
        let Difficulty = localStorage.getItem("Difficulty");
        //set Highscore
        let highScore = { easy: Number(Escore.textContent), medium: Number(Mscore.textContent), hard: Number(Hscore.textContent), level: Number(LevelEl.textContent) };
        switch (Difficulty) {
            case "easy":
                highScore.easy += score;
                break;
            case "medium":
                highScore.medium += score;
                break;
            case "hard":
                highScore.hard += score;
                break;
            default:
                console.log("misleading Error!");
        }
        //Hiscore ui update
        Escore.textContent = highScore.easy;
        Mscore.textContent = highScore.medium;
        Hscore.textContent = highScore.hard;
        //level ui update
        let targetlevel = Number(LevelEl.textContent) * 60;
        let curentlevel = highScore.easy + highScore.medium + highScore.hard;
        if (curentlevel >= targetlevel) {
            let level = Number(LevelEl.textContent);
            LevelEl.textContent = ++level;
        }
        //localstorage update
        localStorage.setItem("HighScore", btoa(JSON.stringify(highScore)));
    }
    //mode control
    function Modecontrol(ev) {
        let range = ev.target.selectedOptions[0].value
        localStorage.setItem("Difficulty", range);
        InitQuiz(range);
    }
    ModeEl.addEventListener('input', Modecontrol);
})()
//app info controls
let infoBtn = document.getElementById("info");
let infoClsBtn = document.querySelector(".close");
let element = document.querySelector(".model");
infoBtn.addEventListener('click', (ev) => {
    if (ev.target.tagName !== "SPAN") {
        ev.preventDefault();
    }
    element.classList.remove('hidden');
    setTimeout(()=>{
        element.classList.add('opacity-100','scale-100');
    },500)
});
infoClsBtn.addEventListener('click', () => {
    element.classList.remove('opacity-100','scale-100');
    element.classList.add('opacity-0','scale-10');
        setTimeout(()=>{
        element.classList.add('hidden');
    },800)
});
//developer mode disable
      document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
    document.onkeydown = (e) => {
      if (e.keyCode == 123) {
          e.preventDefault();
      }
      if (e.ctrlKey && e.shiftKey && (e.key == 'I' || e.key == 'i')) {
          e.preventDefault();
      }
      if (e.ctrlKey && e.shiftKey && (e.key == 'C' || e.key == 'c')) {
          e.preventDefault();
      }
      if (e.ctrlKey && e.shiftKey && (e.key == 'J' || e.key == 'j')) {
          e.preventDefault();
      }
      if (e.altKey  && (e.key == 'f'||e.key == 'F')) {
          e.preventDefault();
      }
      if (e.ctrlKey && (e.key == 'U'|| e.key == 'u')) {
          e.preventDefault();
      }
  };

