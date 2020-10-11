const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

function getRndInteger(minimum: number, maximum: number): number {
    return Math.floor(Math.random() * (maximum - minimum)) + minimum;
}

class Cible {
    public x: number;
    public y: number;
    public rayon: number;

    constructor(){
        this.x = 0;
        this.y = 0;
        this.rayon = 30;
        this.generate_random_coords();
    }

    generate_random_coords(){
        this.x = getRndInteger(0 + this.rayon, canvas.width - this.rayon), getRndInteger(0 + this.rayon, canvas.width - this.rayon)
        this.y = getRndInteger(0 + this.rayon, canvas.height - this.rayon), getRndInteger(0 + this.rayon, canvas.height - this.rayon)
    }
} 

class Timer{
    public baseTime: number;
    public time: number;
    public step: number;
    public is_finished: Boolean;
    public interval_timer: any;

    constructor(baseTime: number, step: number){
        this.baseTime = baseTime;
        this.time = baseTime;
        this.step = step;

        this.is_finished = false;
        this.interval_timer;
    }

    start(): void {
        this.interval_timer = setInterval(() => {this.update()}, 1000);
    }

    stop(): void {
        clearInterval(this.interval_timer);
    }

    update(): boolean {
        if(this.time <= 0){
            this.is_finished = true; // timer finished
        } else {
            this.time -= this.step;
        }
        return false;
    }
}

class Button {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public text: string;
    public button_color: string;
    public text_color: string;
    public text_size: number;
    public action: string;

    constructor(x: number, y: number, width: number, height: number, text: string, button_color: string, text_color: string, text_size: number, action: string) {
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

    show(): void{
        ctx.fillStyle = this.button_color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.text_color;
        ctx.font = `${this.text_size}px Arial`;
        ctx.textAlign="center"; 
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, this.x + (this.width / 2), this.y + (this.height / 2));
        ctx.textAlign="start"; 
        ctx.textBaseline = "alphabetic";
    }

    detect_click(): boolean{
        return mouse.x > this.x && mouse.x < this.x+this.width && mouse.y < this.y+this.height && mouse.y > this.y;
    }

    do_Action(){
        window[this.action]();
    }
}

var cible: Cible = new Cible();
var score: number = 0;
var timer: Timer;
var nb_click: number = 0;
var game_is_start: boolean = false;
var start_button: Button;
var temps: number = 30; /////////////////////// Change for the time
var all_buttons: Array<Button> = [];

var mouse = {
    x: 0,
    y: 0
}

// Menu, text
function show_cible(x: number, y: number, rayon: number): void {
    ctx.fillStyle = "#FF0000";
    ctx.arc(x, y, rayon,0, 2 * Math.PI);
    ctx.fill();
}

function show_timer(): void{
    ctx.font = "30px Arial";
    ctx.fillText(`Temps restant : ${timer.time} / ${timer.baseTime}`,10, 100);
}

function show_score(x: number, y: number): void{
    ctx.font = "30px Arial";
    ctx.fillText(`Score : ${score}`, x, y);
}

function show_menu(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    start_button = new Button(canvas.width / 2 - 150, canvas.height / 2 - 50, 300, 100, "Start !", "red", "white", 40, "start_game");
    start_button.show();
}

function show_end_menu(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);   
    ctx.fillStyle = "black";
    show_score(500, 400);
    let precision: any = Math.round((score / nb_click) * 100);
    if(nb_click === 0 && score === 0) precision = "0"

    ctx.fillText(`Tu as fais ${nb_click} cliques. Tu as donc ${precision}% de précision`, 300, 450);

    let menu_button: Button = new Button(canvas.width / 2 - 150, 550, 300, 100, "Menu", "red", "white", 40, "show_menu");
    menu_button.show();

    game_is_start = false;
}



function check_pixel_color(color: Array<number>): boolean{
    let pixel: Uint8ClampedArray = ctx.getImageData(mouse.x, mouse.y, 1, 1).data;
    return JSON.stringify(Array.from(pixel)) == JSON.stringify(color);
}

function init_game(): void{
    show_menu();
}

function start_game(): void{
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

    if(timer.is_finished){
        return game_end();
    }

    show_cible(cible.x, cible.y, cible.rayon);
    show_score(10, 50);
    show_timer();



    ctx.stroke();
    
    window.requestAnimationFrame(update);
}

function game_end(){
    show_end_menu();
}


/////////////////////////// LISTENERS ///////////////////////////
canvas.addEventListener("mousedown", (evt: MouseEvent) => {
    mouse.x = evt.offsetX;
    mouse.y = evt.offsetY;
    
    if(!game_is_start){
        all_buttons.forEach((button) => {
            if(button.detect_click()){
                // si il y a un clique
                button.do_Action();
            }
        });

        return;
    }

    nb_click += 1;

    if(check_pixel_color([255, 0, 0, 255])){ // color of the cible
        cible.generate_random_coords();
        score += 1;
    }
    
});

init_game();