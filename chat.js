const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const backBtn = document.getElementById('back-btn');
let currentMonkey = null;
let messageCount = 0;

// Tlačítko zpět do kasina
backBtn.addEventListener('click', () => window.location.href = 'index.html');

// Asynchronní načtení databáze opic z JSON souboru
async function loadMonkeyData() {
    try {
        const response = await fetch('monkeys.json');
        const data = await response.json();
        
        // Vybere náhodnou opici z databáze
        currentMonkey = data.profiles[Math.floor(Math.random() * data.profiles.length)];
        
        // Upraví HTML podle vybrané opice
        document.getElementById('chimp-avatar').textContent = currentMonkey.avatar;
        document.getElementById('chimp-name').textContent = currentMonkey.name;
        document.getElementById('chimp-distance').textContent = currentMonkey.distance;
        
        addMessage(`[SYSTÉM]: ${currentMonkey.name} se připojil/a. Cíl: ${currentMonkey.goal}`, false, true);
    } catch (e) {
        console.error("Kritická chyba načítání DB:", e);
        document.getElementById('chimp-name').textContent = "Offline_Opičák";
    }
}

// Funkce pro přidání zprávy do okna
function addMessage(text, isUser, isSystem = false) {
    const msg = document.createElement('div');
    if (isSystem) {
        msg.style.color = 'rgba(0, 255, 85, 0.5)';
        msg.style.fontSize = '0.8rem';
        msg.style.textAlign = 'center';
        msg.style.width = '100%';
        msg.style.marginTop = '10px';
    } else {
        msg.className = `message ${isUser ? 'msg-user' : 'msg-chimp'}`;
    }
    msg.innerHTML = text;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Funkce pro vydírání (bere částku z JSONu)
function addExtortion() {
    if (!currentMonkey) return;
    const msg = document.createElement('div');
    msg.className = 'message msg-chimp';
    msg.innerHTML = `${currentMonkey.extortion_msg} <button class="action-btn" onclick="payMonkey(this, ${currentMonkey.extortion_amount})">ZAPLATIT ${currentMonkey.extortion_amount} Kč VÝPALNÉ</button>`;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Propojení s LocalStorage kasina (Dluhy)
window.payMonkey = function(btn, amount) {
    let debt = parseInt(localStorage.getItem('chimp_debt')) || 0;
    localStorage.setItem('chimp_debt', debt + amount);
    btn.textContent = `ZAPLACENO (Dluh navýšen o ${amount} Kč)`;
    btn.disabled = true;
    btn.style.background = "#555";
    btn.style.color = "#aaa";
    setTimeout(() => addMessage("Banka byla informována. Čas běží.", false, true), 1500);
};

// Odeslání zprávy uživatelem
function sendMessage() {
    const text = chatInput.value.trim();
    if (!text || !currentMonkey) return;
    
    addMessage(text, true);
    chatInput.value = '';
    messageCount++;

    // Reakce opice s prodlevou
    setTimeout(() => {
        if (messageCount === 3) {
            addExtortion();
        } else {
            const randomReply = currentMonkey.replies[Math.floor(Math.random() * currentMonkey.replies.length)];
            addMessage(randomReply, false);
        }
    }, 800 + Math.random() * 1200);
}

// Listenery
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});

// Spuštění po načtení
loadMonkeyData();
