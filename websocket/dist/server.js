"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = 3001;
const frontendUrl = process.env.FRONTEND_SITE_URL;
console.log('Frontend URL:', frontendUrl);
const httpServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: frontendUrl,
        methods: ["GET", "POST"]
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
    },
});
const returnedQuestionIds = new Set();
const connections = new Map();
const playerChoices = new Map();
let monitor = null;
let Game = {
    round: null,
    players: [],
    iteration: 0
};
// New: Keep track of players who have submitted choices for the current round
const submittedChoices = new Set();
function getQuestion() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filePath = path_1.default.join(process.cwd(), '../all.json');
            const fileContents = yield promises_1.default.readFile(filePath, 'utf8');
            const data = JSON.parse(fileContents);
            const availableQuestions = data.questions.filter(q => !returnedQuestionIds.has(q.id));
            if (availableQuestions.length === 0) {
                returnedQuestionIds.clear();
                return getQuestion();
            }
            const randomIndex = Math.floor(Math.random() * availableQuestions.length);
            const selectedQuestion = availableQuestions[randomIndex];
            returnedQuestionIds.add(selectedQuestion.id);
            const { hint1, hint2 } = calculateHints(selectedQuestion.answer);
            return Object.assign(Object.assign({}, selectedQuestion), { hint1,
                hint2 });
        }
        catch (error) {
            console.error('Error in getQuestion:', error);
            throw new Error("Failed to fetch question");
        }
    });
}
function calculateHints(answer) {
    const rangeMatch = answer.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(.*)$/);
    let num;
    let unit;
    if (rangeMatch) {
        const [, start, end, rangeUnit] = rangeMatch;
        num = (parseFloat(start) + parseFloat(end)) / 2;
        unit = rangeUnit;
    }
    else {
        const match = answer.match(/^([\d,]+(?:\.\d+)?)\s*(.*)$/);
        if (!match)
            return { hint1: "N/A", hint2: "N/A" };
        const [, numStr, unitStr] = match;
        num = parseFloat(numStr.replace(/,/g, ''));
        unit = unitStr;
    }
    const percent1 = 1 + Math.random() * 39;
    const percent2 = 1 + Math.random() * 39;
    const hint1Value = num * (1 - percent1 / 100);
    const hint2Value = num * (1 + percent2 / 100);
    const formatHint = (value) => {
        if (answer.match(/^\d{4}$/)) {
            return Math.round(value).toString();
        }
        if (value >= 1000000) {
            return Math.round(value / 1000000) + ' million';
        }
        else if (value >= 1000) {
            return Math.round(value / 1000) + 'k';
        }
        else {
            const hasDecimal = answer.includes('.');
            return hasDecimal ? value.toFixed(2) : Math.round(value);
        }
    };
    if (answer.match(/^\d{4}$/)) {
        return {
            hint2: `above ${formatHint(hint1Value)} ${unit}`.trim(),
            hint1: `below ${formatHint(hint2Value)} ${unit}`.trim(),
        };
    }
    return {
        hint1: `above ${formatHint(hint1Value)} ${unit}`.trim(),
        hint2: `below ${formatHint(hint2Value)} ${unit}`.trim(),
    };
}
function createInitialRound() {
    return __awaiter(this, void 0, void 0, function* () {
        const question = yield getQuestion();
        return {
            step: "question",
            number: 1,
            question: question.question,
            question_english: question.question_english,
            hint1: question.hint1 || '',
            hint2: question.hint2 || '',
            solution: question.answer,
            source: question.source,
            confidence: question.confidence,
        };
    });
}
function initializeGame() {
    return __awaiter(this, void 0, void 0, function* () {
        const initialRound = yield createInitialRound();
        Game = {
            round: initialRound,
            players: [],
            iteration: 0
        };
        // Clear submitted choices when initializing a new game
        submittedChoices.clear();
    });
}
io.use((socket, next) => {
    try {
        next();
    }
    catch (error) {
        console.error('Socket middleware error:', error);
        next(new Error("Authentication error"));
    }
});
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    connections.set(socket.id, socket);
    console.log(`New connection added to the pool: ${socket.id}`);
    if (!Game.round) {
        yield initializeGame();
    }
    socket.on("error", (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
    socket.on("monitor", () => {
        monitor = socket;
        console.log("Monitor set/updated!");
        const event = { game: Game };
        monitor.emit("game_state_update", event);
    });
    socket.on("next_step", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!Game.round) {
                throw new Error("Game round is not initialized");
            }
            switch (Game.round.step) {
                case "question":
                    Game.round.step = "choices";
                    io.emit("make_choice");
                    break;
                case "choices":
                    Game.round.step = "hint1";
                    break;
                case "hint1":
                    Game.round.step = "hint2";
                    break;
                case "hint2":
                    Game.round.step = "solution";
                    break;
                case "solution":
                    Game.round = yield createInitialRound();
                    Game.iteration++;
                    Game.players.forEach(player => {
                        player.choice = undefined;
                        playerChoices.delete(player.name);
                    });
                    // Clear submitted choices for the new round
                    submittedChoices.clear();
                    break;
            }
            io.emit("game_state_update", { game: Game });
        }
        catch (error) {
            console.error("Error in next_step:", error);
            socket.emit("error", { message: "Failed to process next step" });
        }
    }));
    socket.on("join", (event, callback) => {
        try {
            if (!event.name || !event.color) {
                throw new Error("Invalid player data");
            }
            const existingPlayer = Game.players.find(p => p.name.toLowerCase() === event.name.toLowerCase());
            if (existingPlayer) {
                existingPlayer.socketId = socket.id;
                existingPlayer.lastActive = Date.now();
                if (playerChoices.has(existingPlayer.name)) {
                    existingPlayer.choice = playerChoices.get(existingPlayer.name) || undefined;
                }
                callback({ player: existingPlayer });
            }
            else {
                const newPlayer = {
                    id: socket.id,
                    socketId: socket.id,
                    name: event.name.charAt(0).toUpperCase() + event.name.substring(1),
                    color: event.color,
                    lastActive: Date.now()
                };
                Game.players.push(newPlayer);
                if (monitor) {
                    const event = { player: newPlayer };
                    monitor.emit("player_joined", event);
                }
                console.log(`New player "${newPlayer.name}" joined the game!`);
                callback({ player: newPlayer });
            }
            io.emit("game_state_update", { game: Game });
        }
        catch (error) {
            console.error("Error in join:", error);
            callback({ player: null });
        }
    });
    socket.on("get_player_by_name", (event, callback) => {
        try {
            const player = Game.players.find(player => player.name === event.name);
            callback({ player: player || null });
        }
        catch (error) {
            console.error("Error in get_player_by_name:", error);
            callback({ player: null });
        }
    });
    socket.on("choice", (event) => {
        try {
            const player = Game.players.find(p => p.name === event.choice.playerName);
            if (player && !submittedChoices.has(player.name)) {
                player.choice = event.choice.value;
                player.lastActive = Date.now();
                playerChoices.set(player.name, event.choice.value);
                submittedChoices.add(player.name);
                console.log(`Player ${event.choice.playerName} submitted their choice: ${event.choice.value}`);
                io.emit("game_state_update", { game: Game });
            }
            else if (submittedChoices.has((player === null || player === void 0 ? void 0 : player.name) || '')) {
                console.log(`Player ${event.choice.playerName} attempted to submit a second choice, but was prevented.`);
                socket.emit("error", { message: "You have already submitted a choice for this round." });
            }
        }
        catch (error) {
            console.error("Error in choice:", error);
            socket.emit("error", { message: "Failed to submit choice" });
        }
    });
    socket.on("kick_player", (playerName) => {
        try {
            const playerIndex = Game.players.findIndex(p => p.name === playerName);
            if (playerIndex !== -1) {
                const player = Game.players[playerIndex];
                Game.players.splice(playerIndex, 1);
                playerChoices.delete(player.name);
                submittedChoices.delete(player.name);
                const playerSocket = connections.get(player.socketId || '');
                if (playerSocket) {
                    playerSocket.disconnect();
                }
                console.log(`Player ${playerName} has been kicked from the game.`);
                io.emit("game_state_update", { game: Game });
            }
        }
        catch (error) {
            console.error("Error in kick_player:", error);
            socket.emit("error", { message: "Failed to kick player" });
        }
    });
    socket.on("disconnect", () => {
        try {
            connections.delete(socket.id);
            console.log(`Connection removed from the pool: ${socket.id}`);
            const player = Game.players.find(player => player.socketId === socket.id);
            if (player) {
                player.socketId = "";
                player.lastActive = Date.now();
                console.log(`Player ${player.name} disconnected but remains in the game!`);
                io.emit("game_state_update", { game: Game });
            }
            if (monitor === socket) {
                monitor = null;
                console.log("Monitor disconnected!");
            }
        }
        catch (error) {
            console.error("Error in disconnect:", error);
        }
    });
}));
function cleanupInactivePlayers() {
    const now = Date.now();
    Game.players = Game.players.filter(player => {
        if (!player.socketId && (now - player.lastActive) > 5 * 60 * 1000) {
            playerChoices.delete(player.name);
            submittedChoices.delete(player.name);
            return false;
        }
        return true;
    });
    io.emit("game_state_update", { game: Game });
}
setInterval(cleanupInactivePlayers, 60 * 1000);
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
