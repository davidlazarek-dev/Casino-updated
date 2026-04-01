// --- ELEMENTY Z HTML ---
const startOverlay = document.getElementById('start-overlay');
const enterBtn = document.getElementById('enter-btn');
const navBtns = document.querySelectorAll('.nav-btn');
const screens = document.querySelectorAll('.screen');
const balanceEl = document.getElementById('balance');
const bankBalanceEl = document.getElementById('bank-balance');
const bankDebtEl = document.getElementById('bank-debt');
const spinBtn = document.getElementById('spin-btn');
const loanBtn = document.getElementById('loan-btn');
const repayBtn = document.getElementById('repay-btn');
const msgLog = document.getElementById('message-log');
const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];

// --- STAV HRY (Z LocalStorage, sdílí se s chatem) ---
let balance = parseInt(localStorage.getItem('chimp_money')) || 1000;
let debt = parseInt(localStorage.getItem('chimp_debt')) || 0;
const spinCost = 10;
const symbols = ['🦍', '🍌', '💀', '💎', '💩'];

// --- AKTUALIZACE OBRAZOVKY ---
function updateDisplay() {
    balanceEl.textContent = balance;
    bankBalanceEl.textContent = balance;
    bankDebtEl.textContent = debt;
    // Uložení stavu, aby o penězích věděli i opičáci v chatu
    localStorage.setItem('chimp_money', balance);
    localStorage.setItem('chimp_debt', debt);
}

// --- TERMINÁLOVÉ ZPRÁVY ---
function logMessage(msg) {
    msgLog.innerHTML = `> ${msg}<br>` + msgLog.innerHTML;
}

// --- ÚVODNÍ OBRAZOVKA (OBCHÁZÍ BLOKACI ZVUKŮ) ---
enterBtn.addEventListener('click', () => {
    startOverlay.style.display = 'none';
    // Tady bys mohl spustit hudbu: bgMusic.play();
    logMessage("Přístup povolen. Vítejte v undergroundu.");
    updateDisplay();
});

// --- PŘEPÍNÁNÍ ZÁLOŽEK ---
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Ignorujeme tlačítko Chimpinder, protože to je normální odkaz na chat.html
        if(btn.innerText.includes("CHIMPINDER")) return; 
        
        navBtns.forEach(b => b.classList.remove('active'));
        screens.forEach(s => s.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});

// --- HRACÍ AUTOMAT (SLOT MACHINE) ---
spinBtn.addEventListener('click', () => {
    if (balance < spinCost) {
        logMessage("CHYBA: Nedostatek banánů! Vezmi si půjčku.");
        return;
    }

    balance -= spinCost;
    updateDisplay();
    logMessage(`Točím válce (-${spinCost} 🍌)...`);
    
    spinBtn.disabled = true;
    let spins = 0;
    
    const interval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        });
        spins++;
        
        if (spins > 15) {
            clearInterval(interval);
            spinBtn.disabled = false;
            checkWin();
        }
    }, 100);
});

function checkWin() {
    const r1 = reels[0].textContent;
    const r2 = reels[1].textContent;
    const r3 = reels[2].textContent;

    if (r1 === r2 && r2 === r3) {
        let win = 0;
        if (r1 === '🦍') win = 500;
        if (r1 === '🍌') win = 200;
        if (r1 === '💎') win = 1000;
        if (r1 === '💀') win = 0; // Lebka bere vše
        if (r1 === '💩') win = 10;
        
        if (win > 0) {
            balance += win;
            logMessage(`JACKPOT! Získáváš ${win} 🍌!`);
        } else {
            logMessage("Tři lebky... Okamžitá prohra.");
        }
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        balance += 5;
        logMessage("Malá shoda. +5 🍌.");
    } else {
        logMessage("Nic. Příště to určitě vyjde...");
    }
    updateDisplay();
}

// --- UNDERGROUND BANKA ---
loanBtn.addEventListener('click', () => {
    balance += 5000;
    debt += 5000;
    logMessage("Půjčka 5000 🍌 schválena. Radši to rychle vrať.");
    updateDisplay();
});

repayBtn.addEventListener('click', () => {
    if (debt === 0) {
        logMessage("Nemáš žádné dluhy.");
        return;
    }
    if (balance >= debt) {
        balance -= debt;
        logMessage(`Celý dluh (${debt} 🍌) byl splacen.`);
        debt = 0;
    } else {
        logMessage(`Splacena část dluhu: ${balance} 🍌.`);
        debt -= balance;
        balance = 0;
    }
    updateDisplay();
});

// Lichvářské úroky (5% každou minutu)
setInterval(() => {
    if (debt > 0) {
        debt = Math.floor(debt * 1.05);
        updateDisplay();
        logMessage("Banka: Naskočily úroky (+5%).");
    }
}, 60000);

// --- SCAM AD SYSTEM (Generátor otravných vyskakovacích oken) ---
setInterval(() => {
    // 30% šance, že každé 4 sekundy vyskočí virus/reklama
    if(Math.random() > 0.7) {
        let ad = document.createElement('div');
        ad.style.position = 'fixed';
        ad.style.top = Math.random() * 70 + 'vh';
        ad.style.left = Math.random() * 70 + 'vw';
        ad.style.background = '#ff0000';
        ad.style.color = '#fff';
        ad.style.padding = '15px';
        ad.style.border = '3px solid yellow';
        ad.style.fontWeight = 'bold';
        ad.style.zIndex = '9999';
        ad.style.cursor = 'pointer';
        ad.style.boxShadow = '0 0 20px yellow';
        ad.style.fontFamily = '"Comic Sans MS", sans-serif';
        
        const adTexts = [
            "🔥 HORKÉ OPICE VE TVÉM OKOLÍ! KLIKNI 🔥",
            "⚠️ TVŮJ POČÍTAČ JE ZAVIROVÁN! KLIKNI PRO SKEN ⚠️",
            "🍌 VYHRÁL JSI 10 000 BANÁNŮ! VYZVEDNI HNED! 🍌",
            "💀 EXEKUCE NA CESTĚ! ZAPLAŤ POPLATEK ZDE 💀"
        ];
        ad.innerText = adTexts[Math.floor(Math.random() * adTexts.length)];
        
        // Zlomyslná funkce - kliknutí ti sebere banány
        ad.onclick = function() {
            balance -= 100;
            if(balance < 0) balance = 0;
            updateDisplay();
            this.remove();
            alert("KLASICKÝ SCAM! Byl jsi okraden o 100 🍌!");
        };
        
        document.body.appendChild(ad);
        // Reklama zmizí sama po 4 sekundách, pokud na ni neklikne
        setTimeout(() => ad.remove(), 4000);
    }
}, 4000);

// Úplně první inicializace čísel při startu
updateDisplay();
