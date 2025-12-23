/* FINANCE TWIN - LOGIC CORE */

// Global State
let state = {
    mood: "Neutral",
    location: "Home",
    balance: 0,
    imageBase64: null,
    historyData: {
        "current": { inc: 5000, spent: 2000 },
        "last": { inc: 4800, spent: 2500 },
        "2ago": { inc: 5200, spent: 1500 },
        "3ago": { inc: 4500, spent: 3000 }
    }
};

let cameraStream = null;

// --- 1. INITIALIZATION & FINANCIALS ---
window.onload = function() {
    calculateWallet();
};

function updateHistory(period) {
    const data = state.historyData[period];
    if(data) {
        document.getElementById('incomeInput').value = data.inc;
        document.getElementById('spentInput').value = data.spent;
        calculateWallet();
    }
}

function calculateWallet() {
    const inc = parseFloat(document.getElementById('incomeInput').value) || 0;
    const spt = parseFloat(document.getElementById('spentInput').value) || 0;
    state.balance = inc - spt;
    
    const display = document.getElementById('walletDisplay');
    display.innerText = `₹${state.balance}`;
    
    // Visual Color Change for Low Balance
    if(state.balance < 0) display.className = "text-lg font-bold text-red-500 font-mono";
    else if(state.balance < 1000) display.className = "text-lg font-bold text-amber-500 font-mono";
    else display.className = "text-lg font-bold text-emerald-400 font-mono";
}

// --- 2. CONTEXT MANAGEMENT ---
function setMood(mood, btn) {
    state.mood = mood;
    // UI Update
    document.querySelectorAll('.mood-btn').forEach(b => {
        b.classList.remove('active');
        b.classList.add('text-slate-500');
    });
    btn.classList.add('active');
    btn.classList.remove('text-slate-500');
}

// --- 3. CAMERA & IMAGE HANDLING ---
function handleFileSelect(input) {
    const display = document.getElementById('fileNameDisplay');
    if (input.files && input.files[0]) {
        const file = input.files[0];
        display.textContent = `Selected: ${file.name}`;
        display.classList.remove('opacity-0');
        
        // Convert to Base64
        const reader = new FileReader();
        reader.onload = () => {
            state.imageBase64 = reader.result.split(',')[1];
        };
        reader.readAsDataURL(file);
    }
}

async function openCamera() {
    const modal = document.getElementById('camera-modal');
    const video = document.getElementById('camera-feed');
    modal.classList.remove('hidden');

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        video.srcObject = cameraStream;
    } catch (err) {
        alert("Could not access camera. Please allow permissions.");
        closeCamera();
    }
}

function closeCamera() {
    const modal = document.getElementById('camera-modal');
    modal.classList.add('hidden');
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
}

function capturePhoto() {
    const video = document.getElementById('camera-feed');
    const canvas = document.getElementById('camera-canvas');
    const display = document.getElementById('fileNameDisplay');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    // Save Data
    const dataUrl = canvas.toDataURL('image/jpeg');
    state.imageBase64 = dataUrl.split(',')[1];
    
    // UI Update
    display.textContent = "Image Captured via Camera";
    display.classList.remove('opacity-0');
    
    closeCamera();
}

// --- 4. AI ANALYSIS LOGIC ---
async function runAnalysis() {
    // 1. Inputs
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    state.location = document.getElementById('locationSelect').value;
    
    // 2. Validation
    if (!apiKey) { alert("Please enter your Gemini API Key."); return; }
    if (!state.imageBase64) { alert("Please upload an image or use the camera."); return; }

    // 3. UI Loading State
    const glow = document.getElementById('twin-glow');
    const icon = document.getElementById('twin-icon');
    const label = document.getElementById('verdict-label');
    const msg = document.getElementById('prediction-msg');
    const feedback = document.getElementById('feedback-section');

    feedback.classList.add('hidden'); // Hide feedback on new run
    label.innerText = "ANALYZING...";
    label.className = "text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 animate-pulse";
    glow.className = "absolute w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-40 animate-pulse";
    icon.className = "fa-solid fa-spinner fa-spin text-5xl text-blue-400";
    msg.innerHTML = "Consulting neural network...";

    // 4. Prompt Construction
    const prompt = `
    Role: You are a witty, sarcastic financial advisor.
    Context:
    - User Wallet Balance: ₹${state.balance}
    - User Mood: ${state.mood}
    - Location: ${state.location}
    
    Task:
    1. Identify the item in the image.
    2. Estimate price in INR (₹).
    3. Compare Price vs Balance.
    4. If Price > Balance: Verdict "DENIED". Roast them.
    5. If Price < Balance but Mood is 'Impulsive' or 'Stressed': Verdict "WARNING". Be skeptical.
    6. If Price < Balance and safe: Verdict "APPROVED". Be cheeky.

    Output JSON ONLY:
    { "product_name": "str", "estimated_price": int, "verdict": "APPROVED" | "WARNING" | "DENIED", "roast": "str" }
    `;

    try {
        // 5. API Call
        const result = await callGemini(apiKey, prompt, state.imageBase64);
        
        // 6. Update UI
        updateResultUI(result);
        
    } catch (err) {
        console.error(err);
        label.innerText = "ERROR";
        label.className = "text-red-500 font-bold";
        msg.innerText = "System Failure: " + err.message;
        icon.className = "fa-solid fa-bug text-red-500";
    }
}

async function callGemini(key, prompt, image) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: image } }] }]
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json|```/g, '').trim();
    return JSON.parse(text);
}

function updateResultUI(data) {
    const glow = document.getElementById('twin-glow');
    const icon = document.getElementById('twin-icon');
    const label = document.getElementById('verdict-label');
    const msg = document.getElementById('prediction-msg');
    const feedback = document.getElementById('feedback-section');

    // Colors
    let colorClass = "text-emerald-500";
    let glowClass = "bg-emerald-500 opacity-30 pulse-stable";
    let iconClass = "fa-check";

    if (data.verdict === "DENIED") {
        colorClass = "text-red-500";
        glowClass = "bg-red-600 opacity-40 pulse-risk";
        iconClass = "fa-ban";
    } else if (data.verdict === "WARNING") {
        colorClass = "text-amber-500";
        glowClass = "bg-amber-500 opacity-40 pulse-warning";
        iconClass = "fa-triangle-exclamation";
    }

    // Apply
    glow.className = `absolute w-64 h-64 rounded-full blur-[80px] ${glowClass}`;
    icon.className = `fa-solid ${iconClass} text-5xl ${colorClass}`;
    label.className = `text-[10px] font-black uppercase tracking-[0.4em] ${colorClass}`;
    label.innerText = data.verdict;

    msg.innerHTML = `
        <strong class="text-white text-lg block mb-1">${data.product_name}</strong>
        <span class="text-xs text-slate-500 uppercase tracking-widest block mb-4">Est. Price: ₹${data.estimated_price}</span>
        <span class="${colorClass} text-base italic leading-relaxed">"${data.roast}"</span>
    `;

    // Show Feedback
    setTimeout(() => {
        feedback.classList.remove('hidden');
        feedback.classList.add('flex');
    }, 1000);
}

// --- 5. FEEDBACK LOOP ---
function handleFeedback(answer) {
    const section = document.getElementById('feedback-section');
    if (answer === 'yes') {
        section.innerHTML = `<span class="text-xs text-emerald-400 font-bold tracking-widest animate-pulse">PURCHASE RECORDED</span>`;
        // In a real app, we would deduct from wallet here
    } else {
        section.innerHTML = `<span class="text-xs text-blue-400 font-bold tracking-widest animate-pulse">SAVINGS RECORDED</span>`;
    }
}