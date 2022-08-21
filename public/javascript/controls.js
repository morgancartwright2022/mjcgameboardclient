const allIcons = [
    "tiefling_mage.png",
    "half_orc_barbarian.png",
    "cat_ninja.png",
    "human_adventurer.png",
    "cleric.png",
    "human_fighter.png",
    "human_sorceress.png",
    "human_thief.png",
    "bartender.jpg",
    "noble_1.png",
    "noble_2.png",
    "kobold.png",
    "kobold_chieftain.png",
    "goblin.png",
    "orc.png",
    "zombie.png",
    "skeleton.png",
    "wolf.png",
    "snake.png",
    "chest.png",
    "door.png"
];
let selectedImage;
let selectedColor;
let removingImage;
let curBoardId = -1;
let lastRoll;

function getName() {
    const nameBox = document.getElementById("nameBox");
    if(nameBox.value.trim().length < 1)
        return "Anonymous";
    else
        return nameBox.value;
}

/*
 * Toggle the display of a container with the given id
 */
function toggleContainer(id, columnId) {
    // Get the container and its parent column
    const container = document.getElementById(id)
    const column = document.getElementById(columnId)
    
    // Determine whether the container is already hidden
    const hidden = container.classList.contains("hidden");
    
    // Toggle visibility
    if(hidden) {
        container.classList.remove("hidden");
        column.classList.remove("collapsed");
        column.classList.add("expanded");
    }
        
    else {
        container.classList.add("hidden");
        column.classList.add("collapsed");
        column.classList.remove("expanded");
    }
}

/*
 * Hides a container with the given id
 */
function hideContainer(id) {
    // Get the container
    const container = document.getElementById(id);
    
    // Hide it
    container.classList.add("hidden");
}

/*
 * Shows a container with the given id
 */
function showContainer(id) {
    // Get the container
    const container = document.getElementById(id);
    
    // Show it
    container.classList.remove("hidden");
}

/*
 * Set the size of the gameboard
 */
function setGameboardSize(rows, cols) {
    // Get the gameboard
    const gameboard = document.getElementById("gameboard");

    // Generate the contents
    let result = "";
    for(let i = 0; i < rows; i++) {
        result += "<tr>";
        for(let j = 0; j < cols; j++) {
            result +=   "<td class='gameTile' id='tile_" + j + "_" + i + "'>" +
                            "<img width='50px' height='50px' src='public/images/blank.png' onclick='clickTile(" + j + ", " + i + ")'>" +
                        "</td>"
        }
        result += "</tr>";
    }

    // Add to gameboard
    gameboard.innerHTML = result;
}

/*
 * Changed the hover appearance for the gameboard
 */
function setGameboardHover(enable) {
    // Get the gameboard
    const gameboard = document.getElementById("gameboard");

    // Remove red hover
    gameboard.classList.remove("hoverableRed");

    // Set hovering to given value
    if(enable)
        gameboard.classList.add("hoverable");
    else
        gameboard.classList.remove("hoverable");
}

/*
 * Changed the hover appearance for the gameboard (red version)
 */
function setGameboardHoverRed(enable) {
    // Get the gameboard
    const gameboard = document.getElementById("gameboard");

    // Remove regular hover
    gameboard.classList.remove("hoverable");

    // Set hovering to given value
    if(enable)
        gameboard.classList.add("hoverableRed");
    else
        gameboard.classList.remove("hoverableRed");
}

/*
 * Roll virtual dice
 */
function roll() {
    // Get elements
    const count = Number(document.getElementById("dCount").value);
    const sides = Number(document.getElementById("dSides").value);
    const bonus = Number(document.getElementById("dBonus").value);
    const resultBox = document.getElementById("dResult");

    const max = count * sides + bonus;
    let result = 0;
    for(let i = 0; i < count; i++)
        result += Math.ceil(Math.random() * sides);
    result += bonus;

    resultBox.innerHTML = result;
    if(result === max) {
        resultBox.classList.add("crit");
    }
    else {
        resultBox.classList.remove("crit");
    }

    saveRollResult(count, sides, bonus, result, result === max);
}

/*
 * Save the results of a roll for chat
 */
function saveRollResult(count, sides, bonus, result, isCrit) {
    let ret = count + "d" + sides;
    if(bonus > 0)
        ret += "+" + bonus;
    else if(bonus < 0)
        ret += "-" + Math.abs(bonus);
    
    ret += " >> " + result;

    if(isCrit) ret += "!";
    else ret += "."

    lastRoll = ret;
}

/*
 * Send a roll result in chat
 */
function sendRoll() {
    if(lastRoll) {
        const text = getName() + " rolled a die: " + lastRoll;
        showChat(text);
        sendMessage("chat", {text});
        
        if(!lastRoll.includes("(repeat)"))
            lastRoll += " (repeat)";
    }
}


/*
 * Add an image to a tile
 */
function addImage(x, y, src) {
    const tile = document.getElementById("tile_" + x + "_" + y);
    tile.innerHTML = "<img width='50px' height='50px' src='public/images/" + src + "' onclick='clickTile(" + x + ", " + y + ")'>";
    tile.classList.add("hoverable");
    setTimeout(() => {tile.onclick = () => prepareMoveIcon(x, y, src)}, 100);
}

/*
 * Remove an image from a tile
 */
function removeImage(x, y) {
    const tile = document.getElementById("tile_" + x + "_" + y);
    tile.innerHTML = "<img width='50px' height='50px' src='public/images/blank.png' onclick='clickTile(" + x + ", " + y + ")'>";
    tile.classList.remove("hoverable");
    tile.onclick = null;
}

/*
 * Add a color
 */
function addColor(x, y, hex) {
    const tile = document.getElementById("tile_" + x + "_" + y);
    tile.style.backgroundColor = hex;
}

/*
 * Remove a color
 */
function removeColor(x, y) {
    const tile = document.getElementById("tile_" + x + "_" + y);
    tile.style.backgroundColor = "";
}

/*
 * Handle tile clicks
 */
function clickTile(x, y) {
    if(selectedColor) {
        const hex = selectedColor;
        addColor(x, y, hex);
        sendMessage("addColor", {x, y, hex});
    }
    else if(selectedImage) {
        const src = selectedImage;
        removeImage(x, y);
        addImage(x, y, src);
        selectedImage = null;
        sendMessage("addIcon", {x, y, src});
    }
    else if(removingImage) {
        removeImage(x, y);
        removingImage = false;
        sendMessage("removeIcon", {x, y});
    }
    
    if(!selectedColor)
        setGameboardHover(false);
}

/*
 * Display a message
 */
function showChat(text) {
    const chat = document.getElementById("messages");
    chat.innerHTML += "\n" + text;
}

/*
 * Send a chat message
 */
function sendChat() {
    const msgBox = document.getElementById("messageBox");

    const text = getName() + ": " + msgBox.value;
    showChat(text);
    sendMessage("chat", {text});
    msgBox.value = "";
}

/*
 * Reset all tool related variables
 */
function resetTools() {
    setGameboardHover(false);
    selectedImage = null;
    removingImage = false;
    clearColor();
}

/*
 * Select an icon for placement
 */
function selectIcon(src) {
    resetTools();
    selectedImage = src;
    hideContainer("iconPopup");
    setGameboardHover(true);
}

/*
 * Prepare to remove an icon
 */
function prepareRemoveIcon() {
    resetTools();
    removingImage = true;
    setGameboardHoverRed(true);
}

/*
 * Prepare to move an icon
 */
function prepareMoveIcon(x, y, src) {
    if(!selectedColor && !selectedImage && !removingImage) {
        resetTools();

        // Prepare to add a new tile
        selectIcon(src);

        // Remove the old tile
        removeImage(x, y);

        // Send remove message
        sendMessage("removeIcon", {x, y});
    }
}

function selectColor() {
    resetTools();
    const hex = document.getElementById("colorHex").value;
    const colorDisplay = document.getElementById("colorDisplay");
    const colorIndicator = document.getElementById("colorIndicator");

    const regex = /[0-9A-Fa-f]{6}/g;
    if(hex.length === 7 && regex.test(hex.substring(1))) {
        selectedColor = hex;
        colorDisplay.innerHTML = "Selected: " + hex;
        colorIndicator.style.backgroundColor = hex;
        showContainer("colorIndicator");
        hideContainer("colorPopup");
    }

    setGameboardHover(true);
}

function clearColor() {
    const colorDisplay = document.getElementById("colorDisplay");
    selectedColor = null;
    colorDisplay.innerHTML = "Selected: none";
    hideContainer("colorIndicator");
    hideContainer("colorPopup");
    setGameboardHover(false);
}

/*
 * Initalize all controls
 */
function init() {
    // Get all buttons
    const minMsgBtn = document.getElementById("messageMin");
    const minActionBtn = document.getElementById("actionsMin");
    const closeIconsBtn = document.getElementById("iconClose");
    const rollBtn = document.getElementById("dRoll");
    const openIconPopupBtn = document.getElementById("openIconPopup");
    const removeIconBtn = document.getElementById("removeIcon");
    const moveIconBtn = document.getElementById("moveIcon");
    const openColorPopupBtn = document.getElementById("addColor");
    const closeColorBtn = document.getElementById("colorClose");
    const selectedColorBtn = document.getElementById("colorSubmit");
    const clearColorBtn = document.getElementById("colorClear");
    const sendRollBtn = document.getElementById("dSend");

    // Add listeners
    minMsgBtn.onclick = () => toggleContainer("messageBoard", "col1");
    minActionBtn.onclick = () => toggleContainer("actionBox", "col3");
    closeIconsBtn.onclick = () => hideContainer("iconPopup");
    openIconPopupBtn.onclick = () => showContainer("iconPopup");
    removeIconBtn.onclick = () => prepareRemoveIcon();
    openColorPopupBtn.onclick = () => showContainer("colorPopup");
    closeColorBtn.onclick = () => hideContainer("colorPopup");
    selectedColorBtn.onclick = () => selectColor();
    clearColorBtn.onclick = () => clearColor();
    sendRollBtn.onclick = () => sendRoll();
    moveIconBtn.onclick = () => resetTools();

    rollBtn.onclick = () => roll();
}

function newBoard(rows, cols) {
    setGameboardSize(rows, cols);
    sendMessage("newBoard", {rows, cols});
}

function retrieveBoard(boardId) {
    sendMessage("loadBoard", {boardId});
}

function loadIcons() {
    const iconList = document.getElementById("iconList");
    allIcons.forEach(icon => {
        iconList.innerHTML += '<div class="iconSelect">' +
                                 '<img src="public/images/' + icon + '">' +
                              '</div>';
    });

    const iconSelectBtns = document.getElementsByClassName("iconSelect");
    
    for(let i = 0; i < iconSelectBtns.length; i++) {
        iconSelectBtns[i].onclick = e => {
            selectIcon(allIcons[i]);
        }
    }
}

function setBoardId(id) {
    curBoardId = id;
}

function loadData(gamestate) {
    setBoardId(gamestate.id);
    setGameboardSize(gamestate.boardSize.rows, gamestate.boardSize.cols);
    gamestate.icons.forEach(icon => {
        addImage(icon.x, icon.y, icon.src);
    });
    gamestate.colors.forEach(color => {
        addColor(color.x, color.y, color.hex);
    });
}

function saveBoard() {
    if(curBoardId !== -1)
        sendMessage("saveBoard", {boardId: curBoardId});
}

addEventListener('load', () => {
    init();
    loadIcons();
});