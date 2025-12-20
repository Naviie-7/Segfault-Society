// script.js

function runScenario(type) {
    const glow = document.getElementById('twin-glow');
    const core = document.getElementById('twin-core');
    const icon = document.getElementById('twin-icon');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const predictionMsg = document.getElementById('prediction-msg');
    const riskPercent = document.getElementById('risk-percent');
    const card = document.getElementById('insight-card');

    if (type === 'risk') {
        // TRIGGER INTERVENTION
        glow.className = "absolute w-64 h-64 bg-rose-500 rounded-full glow-warning transition-all duration-1000";
        core.style.borderColor = "#f43f5e";
        core.style.boxShadow = "0 0 40px rgba(244, 63, 94, 0.4)";
        icon.style.color = "#f43f5e";
        
        statusDot.className = "h-2 w-2 bg-rose-500 rounded-full animate-ping";
        statusText.innerText = "Intervention Active";
        statusText.className = "text-xs font-bold text-rose-500 uppercase tracking-widest";
        
        predictionMsg.innerText = "Pattern Detected: You are near 'The Coffee House' at a high-stress time. Prediction: ₹250 impulsive splurge. Action: Drink the water in your bag.";
        
        riskPercent.innerText = "88%";
        riskPercent.className = "text-xl font-bold text-rose-500";
        
        card.classList.add('risk-border');
        
    } else {
        // RESET TO SAFE
        glow.className = "absolute w-64 h-64 bg-emerald-500 rounded-full blur-[80px] opacity-20 glow-stable transition-all duration-1000";
        core.style.borderColor = "#10b981";
        core.style.boxShadow = "0 0 30px rgba(16,185,129,0.2)";
        icon.style.color = "#10b981";
        
        statusDot.className = "h-2 w-2 bg-emerald-500 rounded-full animate-pulse";
        statusText.innerText = "Model Stable";
        statusText.className = "text-xs font-bold text-emerald-500 uppercase tracking-widest";
        
        predictionMsg.innerText = "Your spending patterns are currently optimized for your ₹10000 savings goal.";
        
        riskPercent.innerText = "2%";
        riskPercent.className = "text-xl font-bold text-emerald-500";
        
        card.classList.remove('risk-border');
    }
}

// Initialize breathing on load
window.onload = () => {
    document.getElementById('twin-glow').classList.add('glow-stable');
};
