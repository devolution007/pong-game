// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 6,
    dy: 0
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 4
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    speedX: 5,
    speedY: 5,
    maxSpeed: 8
};

let playerScore = 0;
let computerScore = 0;
const winScore = 5;

// Keyboard input
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse control
let mouseY = canvas.height / 2;
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawCenter() {
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Update functions
function updatePlayer() {
    // Arrow keys or mouse control
    if (keys['ArrowUp'] || keys['w']) {
        player.y = Math.max(0, player.y - player.speed);
    }
    if (keys['ArrowDown'] || keys['s']) {
        player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    }
    
    // Mouse control
    const playerCenter = player.y + player.height / 2;
    const distance = mouseY - playerCenter;
    if (Math.abs(distance) > 5) {
        player.y += distance * 0.1;
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    }
}

function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const distance = ballCenter - computerCenter;

    // AI follows the ball with slight delay for gameplay balance
    if (Math.abs(distance) > 35) {
        if (distance > 0) {
            computer.y = Math.min(canvas.height - computer.height, computer.y + computer.speed);
        } else {
            computer.y = Math.max(0, computer.y - computer.speed);
        }
    }
}

function updateBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Top and bottom collision
    if (ball.y - ball.size <= 0 || ball.y + ball.size >= canvas.height) {
        ball.speedY = -ball.speedY;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }

    // Left paddle collision
    if (
        ball.x - ball.size <= player.x + player.width &&
        ball.y >= player.y &&
        ball.y <= player.y + player.height &&
        ball.speedX < 0
    ) {
        ball.speedX = -ball.speedX;
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.speedY += hitPos * 2;
        ball.speedY = Math.max(-ball.maxSpeed, Math.min(ball.maxSpeed, ball.speedY));
    }

    // Right paddle collision
    if (
        ball.x + ball.size >= computer.x &&
        ball.y >= computer.y &&
        ball.y <= computer.y + computer.height &&
        ball.speedX > 0
    ) {
        ball.speedX = -ball.speedX;
        ball.x = computer.x - ball.size;
        
        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.speedY += hitPos * 2;
        ball.speedY = Math.max(-ball.maxSpeed, Math.min(ball.maxSpeed, ball.speedY));
    }

    // Scoring
    if (ball.x < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    }

    if (ball.x > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }

    // Check for win
    if (playerScore >= winScore) {
        alert(`🎉 You won! Final score: ${playerScore} - ${computerScore}`);
        resetGame();
    } else if (computerScore >= winScore) {
        alert(`💻 Computer won! Final score: ${playerScore} - ${computerScore}`);
        resetGame();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.speedY = (Math.random() - 0.5) * 4;
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    resetBall();
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw elements
    drawCenter();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();

    // Update game state
    updatePlayer();
    updateComputer();
    updateBall();

    requestAnimationFrame(gameLoop);
}

// Start the game
resetBall();
gameLoop();
