const SYMBOLS = ['🦍', '🍌', '💎', '🍒', '💣'];
const PAYOUTS = { '💎': 10000, '🦍': 5000, '🍌': 1500, '🍒': 500 };
const SPIN_COST = 100;
const REPAY_AMOUNT = 500;

class GameState {
    constructor() {
        this.money = parseInt(localStorage.getItem('chimp_money')) || 1000;
        this.debt = parseInt(localStorage.getItem('chimp_debt')) || 0;
        this.updateDOM();
    }
    save() {
        localStorage.setItem('chimp_money', this.money);
        localStorage.setItem('chimp_debt', this.debt);
        this.updateDOM();
    }
    addMoney(amt) { this.money += amt; this.save(); }
    spendMoney(amt) {
        if (this.money >= amt) { this.money -= amt; this.save(); return true; }
        return false;
    }
    addDebt(amt) { this.debt += amt; this.money += amt; this.save(); }
    repayDebt(amt) {
        if (this.debt > 0 && this.money >= amt) {
            const actualRepay = Math.min(this.debt, amt);
            this.debt -= actualRepay;
            this.money -= actualRepay;
            this.save();
        }
    }
    updateDOM() {
        const mDisp = document.getElementById('money-display');
        const dDisp = document.getElementById('debt-display');
        if(mDisp) mDisp.textContent = this.money;
        if(dDisp) dDisp.textContent = this.debt;
        const repayBtn = document.getElementById('repay-btn');
        if(repayBtn) repayBtn.disabled = (this.debt === 0 || this.money < REPAY_AMOUNT);
    }
}

class SlotMachine {
    constructor(state, ui) {
        this.state = state;
        this.ui = ui;
        this.isSpinning = false;
        this.reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];
        document.getElementById('spin-btn').addEventListener('click', () => this.spin());
        document.getElementById('repay-btn').addEventListener('click', () => this.state.repayDebt(REPAY_AMOUNT));
    }

    async spin() {
        if (this.isSpinning) return;
        if (!this.state.spendMoney(SPIN_COST)) {
            this.ui.showToast('NEMÁŠ PRACHY', 'Běž do banky nebo si najdi práci. Opičí exekutor je na cestě.');
            return;
        }

        this.isSpinning = true;
        this.ui.setMessage('Točím...', '');
        
        this.reels.forEach(r => {
            r.classList.add('spinning');
            r.classList.remove('landed');
        });

        const results = [];
        for (let i = 0; i < this.reels.length; i++) {
            await new Promise(res => setTimeout(res, 800 + (i * 400)));
            const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            results.push(symbol);
            this.reels[i].classList.remove('spinning');
            void this.reels[i].offsetWidth; 
            this.reels[i].classList.add('landed');
            this.reels[i].textContent = symbol;
        }

        this.checkWin(results);
        this.isSpinning = false;
    }

    checkWin(results) {
        if (results[0] === results[1] && results[1] === results[2]) {
            const winAmt = PAYOUTS[results[0]] || 0;
            if (winAmt > 0) {
                this.state.addMoney(winAmt);
                this.ui.setMessage(`JACKPOT! +${winAmt} Kč`, 'win');
                if(Math.random() > 0.5) AdSystem.spawn();
            } else if (results[0] === '💣') {
                this.state.money = 0;
                this.state.save();
                this.ui.setMessage('BOMBA! Všechny peníze shořely.', 'lose');
            }
        } else {
            this.ui.setMessage('Zkus to znovu...', 'lose');
            if (Math.random() > 0.8) AdSystem.spawn();
        }
    }
}

class UIManager {
    constructor() {
        this.toastContainer = document.getElementById('toast-container');
        this.msgBox = document.getElementById('message');
    }
    setMessage(text, className) {
        if(!this.msgBox) return;
        this.msgBox.textContent = text;
        this.msgBox.className = className;
    }
    showToast(title, body) {
        const toast = document.createElement('div');
        toast.className = 'chimp-toast show';
        toast.innerHTML = `<div class="toast-header">${title}</div><div class="toast-body">${body}</div>`;
        this.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 600);
        }, 4000);
    }
}

class AdSystem {
    static spawn() {
        const ad = document.createElement('div');
        ad.className = 'fake-ad';
        ad.style.top = `${Math.random() * 60 + 10}vh`;
        ad.style.left = `${Math.random() * 60 + 10}vw`;
        ad.innerHTML = `
            <button class="close-btn" onclick="this.parentElement.remove()">X</button>
            OPIČÍ VIRUS DETEKOVÁN<br><br>
            ZAPLAŤ NEBO TVŮJ POČÍTAČ VYBUCHNE!
            <button class="chat-btn" onclick="window.location.href='chat.html'">ZAPLATIT BANÁNY</button>
        `;
        document.getElementById('ad-container').appendChild(ad);
    }
}

class Navigation {
    static init(state, ui) {
        document.getElementById('nav-casino').addEventListener('click', () => location.reload());
        document.getElementById('nav-bank').addEventListener('click', () => this.renderBank(state, ui));
        document.getElementById('nav-chat').addEventListener('click', () => window.location.href = 'chat.html');
    }

    static renderBank(state, ui) {
        const panel = document.getElementById('main-panel');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('nav-bank').classList.add('active');
        
        panel.innerHTML = `
            <header class="header">
                <h1>Underground Banka</h1>
                <p class="subtitle">Úrok 5% za minutu</p>
            </header>
            <section class="status-bar">
                <div class="status-box"><div class="status-label">Zůstatek</div><div class="status-val val-good" id="bank-money">${state.money}</div></div>
                <div class="status-box"><div class="status-label">Dluh</div><div class="status-val val-bad" id="bank-debt">${state.debt}</div></div>
            </section>
            <div class="bank-actions">
                <div class="action-card">
                    <h3>Rychlá Půjčka</h3>
                    <p>Půjč si <strong>5000 Kč</strong> ihned. Na následky se neptej.</p>
                    <button class="btn-primary" id="borrow-btn">Půjčit 5000 Kč</button>
                </div>
            </div>
        `;
        
        document.getElementById('borrow-btn').addEventListener('click', () => {
            state.addDebt(5000);
            document.getElementById('bank-money').textContent = state.money;
            document.getElementById('bank-debt').textContent = state.debt;
            ui.showToast('PŮJČKA SCHVÁLENA', 'Peníze byly připsány. Gorily si pamatují tvůj obličej.');
        });
    }
}

const gameState = new GameState();
const uiManager = new UIManager();
if(document.getElementById('reels-container')) {
    new SlotMachine(gameState, uiManager);
}
Navigation.init(gameState, uiManager);

setInterval(() => {
    if (gameState.debt > 0) {
        const interest = Math.ceil(gameState.debt * 0.05);
        gameState.debt += interest;
        gameState.save();
        uiManager.showToast('ÚROK STRŽEN', `Banka ti napařila úrok ${interest} Kč. Čas běží.`);
        
        const dDisp = document.getElementById('bank-debt');
        if(dDisp) dDisp.textContent = gameState.debt;
    }
}, 60000);
