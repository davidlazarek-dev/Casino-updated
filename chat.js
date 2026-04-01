const chatBox = document.getElementById('chat-box');
const quickReplies = document.getElementById('quick-replies');

let balance = parseInt(localStorage.getItem('chimp_money')) || 1000;
let currentMonkey = null;

// Načtení opičáků z JSONu
fetch('monkeys.json')
    .then(response => response.json())
    .then(data => {
        startScam(data.monkeys);
    });

function startScam(monkeys) {
    // Vybere náhodného opičáka ze seznamu
    currentMonkey = monkeys[Math.floor(Math.random() * monkeys.length)];
    
    addMessage("SYSTÉM", `Nalezena shoda! ${currentMonkey.name} je 0.5 km od tebe.`, 'system');
    
    setTimeout(() => {
        addMessage(currentMonkey.name, currentMonkey.initial_msg, 'monkey');
        showReplies(currentMonkey.replies);
    }, 1500);
}

function addMessage(sender, text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.innerHTML = `<strong>${sender}:</strong> <p>${text}</p>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showReplies(replies) {
    quickReplies.innerHTML = '';
    replies.forEach(reply => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.style.fontSize = '0.8rem';
        btn.style.margin = '5px';
        btn.innerText = reply.text.replace("Kč", "🍌"); // Pojistka pro banány
        
        btn.onclick = () => {
            addMessage("TY", reply.text.replace("Kč", "🍌"), 'user');
            quickReplies.innerHTML = '';
            
            setTimeout(() => {
                if (reply.action === "pay") {
                    handlePayment(reply.amount);
                } else {
                    addMessage(currentMonkey.name, reply.response.replace("Kč", "🍌"), 'monkey');
                    // Po krátké pauze ukončíme nebo restartujeme chat
                    setTimeout(() => location.reload(), 3000);
                }
            }, 1000);
        };
        quickReplies.appendChild(btn);
    });
}

function handlePayment(amount) {
    if (balance >= amount) {
        balance -= amount;
        localStorage.setItem('chimp_money', balance);
        addMessage("SYSTÉM", `Úspěšně jsi poslal ${amount} 🍌. ${currentMonkey.name} tě teď miluje (nebo aspoň tvou peněženku).`, 'system');
    } else {
        addMessage("SYSTÉM", "PLATBA SELHALA: Nemáš dost banánů! Jdi si půjčit do banky.", 'system');
    }
    setTimeout(() => {
        addMessage(currentMonkey.name, "Dík za banány, čau! (Uživatel se odpojil)", 'monkey');
        setTimeout(() => location.reload(), 4000);
    }, 1500);
}
