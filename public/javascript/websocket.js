let ws;

/*
 * Initalize the websocket
 */
function initSocket() {
    if(ws) {
        ws.onerror = null;
        ws.onopen = null;
        ws.onclose = null;
        ws.close();
    }

    ws = new WebSocket("wss://mjcgameboard.herokuapp.com/");
    //ws = new WebSocket("ws://localhost:3000");
    ws.onopen = () => {
        console.log("Connection opened");
        sendMessage("newClient", {});
    }
    ws.onmessage = (msg) => {
        receiveMessage(msg.data);
    }
    ws.onclose = () => {
        ws = null;
    }
}

/*
 * Send a message through the websocket
 */
function sendMessage(type, params) {
    const message = {type, params};
    if(!ws)
        showChat("Server: No connection.");
    else
        ws.send(JSON.stringify(message));
}

/*
 * Receive a websocket message
 */
function receiveMessage(message) {
    // Get the message data
    const {type, params} = JSON.parse(message);

    // Perform action based on type of message
    switch(type) {
        case "chat":
            showChat(params.text);
            break;
        case "addIcon":
            addImage(params.x, params.y, params.src);
            break;
        case "removeIcon":
            removeImage(params.x, params.y);
            break;
        case "newBoard":
            setGameboardSize(params.rows, params.cols);
            break;
        case "addColor":
            addColor(params.x, params.y, params.hex);
            break;
        case "ping":
            sendMessage("ping", {});
            break;
        case "serverData":
            loadData(params.gamestate);
            break;
        default:
            console.log("Unexpected message type: " + type);
    }
}

/*
 * Initialize some event listeners
 */
function addListeners() {
    // Get the elements
    const msgBox = document.getElementById("messageBox");
    const sendBtn = document.getElementById("sendButton");

    // Add listeners
    sendBtn.onclick = () => {sendChat()};
    msgBox.onkeydown = e => {
        if(e.key === 'Enter')
            sendChat();
    }
}
    
addEventListener('load', () => {
    initSocket();
    addListeners();
});