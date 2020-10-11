"use strict";
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
function getRndInteger(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum)) + minimum;
}
class Cible {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.rayon = 30;
        this.generate_random_coords();
    }
    generate_random_coords() {
        this.x = getRndInteger(0 + this.rayon, canvas.width - this.rayon), getRndInteger(0 + this.rayon, canvas.width - this.rayon);
        this.y = getRndInteger(0 + this.rayon, canvas.height - this.rayon), getRndInteger(0 + this.rayon, canvas.height - this.rayon);
    }
}
class Timer {
    constructor(baseTime, step) {
        this.baseTime = baseTime;
        this.time = baseTime;
        this.step = step;
        this.is_finished = false;
        this.interval_timer;
    }
    start() {
        this.interval_timer = setInterval(() => { this.update(); }, 1000);
    }
    stop() {
        clearInterval(this.interval_timer);
    }
    update() {
        if (this.time <= 0) {
            this.is_finished = true; // timer finished
        }
        else {
            this.time -= this.step;
        }
        return false;
    }
}
class Button {
    constructor(x, y, width, height, text, button_color, text_color, text_size, action) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.button_color = button_color;
        this.text_color = text_color;
        this.text_size = text_size;
        this.action = action;
        all_buttons.push(this);
    }
    show() {
        ctx.fillStyle = this.button_color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.text_color;
        ctx.font = `${this.text_size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
    }
    detect_click() {
        return mouse.x > this.x && mouse.x < this.x + this.width && mouse.y < this.y + this.height && mouse.y > this.y;
    }
    do_Action() {
        window[this.action]();
    }
}
var cible = new Cible();
var score = 0;
var timer;
var nb_click = 0;
var game_is_start = false;
var start_button;
var temps = 30; /////////////////////// Change for the time
var all_buttons = [];
var mouse = {
    x: 0,
    y: 0
};
// Menu, text
function show_cible(x, y, rayon) {
    ctx.fillStyle = "#FF0000";
    ctx.arc(x, y, rayon, 0, 2 * Math.PI);
    ctx.fill();
}
function show_timer() {
    ctx.font = "30px Arial";
    ctx.fillText(`Temps restant : ${timer.time} / ${timer.baseTime}`, 10, 100);
}
function show_score(x, y) {
    ctx.font = "30px Arial";
    ctx.fillText(`Score : ${score}`, x, y);
}
function show_menu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    start_button = new Button(canvas.width / 2 - 150, canvas.height / 2 - 50, 300, 100, "Start !", "red", "white", 40, "start_game");
    start_button.show();
}
function show_end_menu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    show_score(500, 400);
    let precision = Math.round((score / nb_click) * 100);
    if (nb_click === 0 && score === 0)
        precision = "0";
    ctx.fillText(`Tu as fais ${nb_click} cliques. Tu as donc ${precision}% de précision`, 300, 450);
    let menu_button = new Button(canvas.width / 2 - 150, 550, 300, 100, "Menu", "red", "white", 40, "show_menu");
    menu_button.show();
    game_is_start = false;
}
function check_pixel_color(color) {
    let pixel = ctx.getImageData(mouse.x, mouse.y, 1, 1).data;
    return JSON.stringify(Array.from(pixel)) == JSON.stringify(color);
}
function init_game() {
    show_menu();
}
function start_game() {
    game_is_start = true;
    timer = new Timer(temps, 1);
    timer.start();
    score = 0;
    update();
}
// Boucle du jeux
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    if (timer.is_finished) {
        return game_end();
    }
    show_cible(cible.x, cible.y, cible.rayon);
    show_score(10, 50);
    show_timer();
    ctx.stroke();
    window.requestAnimationFrame(update);
}
function game_end() {
    show_end_menu();
}
/////////////////////////// LISTENERS ///////////////////////////
canvas.addEventListener("mousedown", (evt) => {
    mouse.x = evt.offsetX;
    mouse.y = evt.offsetY;
    if (!game_is_start) {
        all_buttons.forEach((button) => {
            if (button.detect_click()) {
                // si il y a un clique
                button.do_Action();
            }
        });
        return;
    }
    nb_click += 1;
    if (check_pixel_color([255, 0, 0, 255])) { // color of the cible
        cible.generate_random_coords();
        score += 1;
    }
});
init_game();
