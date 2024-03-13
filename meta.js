class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Bubble {
    constructor(position, velocity, size, charge = 1) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.charge = charge;
    }

    move(dt) {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        if(this.position.x < this.size || this.position.x > innerWidth - this.size) {
            this.velocity.x *= -1;
        }

        if(this.position.y < this.size || this.position.y > innerHeight - this.size) {
            this.velocity.y *= -1;
        }
    }
}

// Debug frame by frame
// let deltaT = 0;
// const incrementT = 32;

// document.addEventListener("keydown", (e) => {
//     let delta = 0;
//     if(e.key == 'q') {
//         deltaT -= incrementT;
//     }
//     else if(e.key == 'w') {
//         deltaT += incrementT;
//     }
// });

const count = 16;
const sizeMin = 20;
const sizeMax = 120;
const velocityMax = 50;
const positiveP = 0.8;
const gridSize = 12;
const showGrid = false;
const halfGridSize = gridSize / 2;

let treshold = 2.2;
const gamma = (r, x, y, x0, y0) => {
    x -= x0;
    y -= y0;
    return r / Math.sqrt(x * x + y * y);
}

const color = '#bfed1a';
const bgColor = '#2d0d38';

const baner = document.getElementById('baner');

const canvas = document.getElementById('container');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext('2d');

const bubbleCollection = [];
for(let i = 0; i < count; i++) {

    const r = Math.round(Math.random() * (sizeMax - sizeMin) + sizeMin);
    const q = (Math.random() / positiveP) <= 1;

    const p = new Vector(
        Math.round(Math.random() * (innerWidth - 2 * r) + r),
        Math.round(Math.random() * (innerHeight - 2 * r) + r)
    );

    const v = new Vector(
        Math.round(Math.random() * 2 * velocityMax - velocityMax),
        Math.round(Math.random() * 2 * velocityMax - velocityMax)
    );
    if(q) {
        bubbleCollection.push(new Bubble(p, v, r, 1));
    }
    else {
        bubbleCollection.push(new Bubble(p, v, r, -1));
    }

}

// Start simulation
let pts = performance.now();
// let pts = deltaT;    // Debug frame by frame
animate();


function animate() {
    requestAnimationFrame(animate);

    clearFrame();


    let cts = performance.now();
    // let cts = deltaT;    // Debug frame by frame

    let dt = cts - pts;
    pts = cts;

    // FPS indicator
    // baner.innerText = Math.round(1000 / dt) + ' fps';
    dt /= 1000;

    bubbleCollection.forEach( (b) => {
        b.move(dt);
    });

    let values = [];

    for(let u = 0; u <= innerWidth + gridSize; u += gridSize) {

        let column = [];

        for(v = 0; v <= innerHeight + gridSize; v += gridSize) {

            let f = 0;

            bubbleCollection.forEach( (b) => {
                f += gamma(b.size * b.charge, u, v, b.position.x, b.position.y);
            });

            column.push(f);
        }

        values.push(column);
    }
    for(let u = 1; u < values.length; u++) {
        for(let v = 1; v < values[u].length; v++) {
            let sqv = [0, 0, 0, 0];
            let sqb = 0;

            sqv[0] = values[u-1][v-1];
            sqv[1] = values[u][v-1];
            sqv[2] = values[u-1][v];
            sqv[3] = values[u][v];

            sqb += (values[u-1][v-1] > treshold) * 1;
            sqb += (values[u][v-1] > treshold) * 2;
            sqb += (values[u-1][v] > treshold) * 4;
            sqb += (values[u][v] > treshold) * 8;

            let x = u * gridSize;
            let y = v * gridSize;


            // Render debug grid
            // ctx.strokeStyle = 'rgba(191, 237, 26, 0.5)';
            // ctx.lineWidth = 1;
            // ctx.beginPath();
            // ctx.rect(x - gridSize, y - gridSize, gridSize, gridSize);
            // ctx.stroke();



            ctx.strokeStyle = color;
            ctx.lineWidth = 2;

            switch(sqb) {
                case 0:
                case 16:
                    break;
                case 1:
                case 14:
                    ctx.beginPath();
                    ctx.moveTo(x - gridSize, y - aprox(gridSize, sqv[0], sqv[2]));
                    ctx.lineTo(x - aprox(gridSize, sqv[0], sqv[1]), y - gridSize);
                    ctx.stroke();
                    break;

                case 2:
                case 13:
                    ctx.beginPath();
                    ctx.moveTo(x - aprox(gridSize, sqv[0], sqv[1]), y - gridSize);
                    ctx.lineTo(x, y - aprox(gridSize, sqv[1], sqv[3]));
                    ctx.stroke();
                    break;

                case 4:
                case 11:
                    ctx.beginPath();
                    ctx.moveTo(x - gridSize, y - aprox(gridSize, sqv[0], sqv[2]));
                    ctx.lineTo(x - aprox(gridSize, sqv[2], sqv[3]), y);
                    ctx.stroke();
                    break;

                case 7:
                case 8:
                    ctx.beginPath();
                    ctx.moveTo(x - aprox(gridSize, sqv[2], sqv[3]), y);
                    ctx.lineTo(x, y - aprox(gridSize, sqv[1], sqv[3]));
                    ctx.stroke();
                    break;

                case 3:
                case 12:
                    ctx.beginPath();
                    ctx.moveTo(x - gridSize, y - aprox(gridSize, sqv[0], sqv[2]));
                    ctx.lineTo(x, y - aprox(gridSize, sqv[1], sqv[3]));
                    ctx.stroke();
                    break;

                case 5:
                case 10:
                    ctx.beginPath();
                    ctx.moveTo(x - aprox(gridSize, sqv[0], sqv[1]), y - gridSize);
                    ctx.lineTo(x - aprox(gridSize, sqv[2], sqv[3]), y);
                    ctx.stroke();
                    break;

                case 6:
                    ctx.beginPath();
                    ctx.moveTo(x - aprox(gridSize, sqv[0], sqv[1]), y - gridSize);
                    ctx.lineTo(x, y - aprox(gridSize, sqv[1], sqv[3]));
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x - gridSize, y - aprox(gridSize, sqv[0], sqv[2]));
                    ctx.lineTo(x - aprox(gridSize, sqv[2], sqv[3]), y);
                    ctx.stroke();
                    break;

                case 9:
                    ctx.beginPath();
                    ctx.moveTo(x - gridSize, y - aprox(gridSize, sqv[0], sqv[2]));
                    ctx.lineTo(x - aprox(gridSize, sqv[0], sqv[1]), y - gridSize);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x - aprox(gridSize, sqv[2], sqv[3]), y);
                    ctx.lineTo(x, y - aprox(gridSize, sqv[1], sqv[3]));
                    ctx.stroke();
                    break;

                default:
                    break;
            }
        }
    }

    // Render debug bubble
    // bubbleCollection.forEach( (b) => {
    //     if(b.charge > 0) {
    //         ctx.strokeStyle = 'green';
    //     }
    //     else {
    //         ctx.strokeStyle = 'red';
    //     }

    //     ctx.lineWidth = 1;
    //     ctx.beginPath();
    //     ctx.arc(b.position.x, b.position.y, b.size, 0, 2 * Math.PI);
    //     ctx.stroke();
    // });




}

function hash(u, v) {
    return u + ' ' + v;
}

function aprox(step, va, vb) {
    return step - step * (treshold - va) / (vb - va);
}




function clearFrame() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
}
