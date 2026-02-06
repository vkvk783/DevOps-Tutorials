// Character sets
const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  number: '0123456789',
  symbol: "!@#$%^&*()-_=+[]{};:,.<>?/|~`"
};

// Elements
const lengthRange = document.getElementById('length');
const lengthValue = document.getElementById('lengthValue');
const generateBtn = document.getElementById('generateBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const passwordEl = document.getElementById('password');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const eyeBtn = document.getElementById('eyeBtn');

// Sync UI for slider
lengthRange.addEventListener('input', ()=>{
  lengthValue.textContent = lengthRange.value;
  updateStrength(passwordEl.textContent || '');
});

// pick a random character from a string
function pickRandom(str){
  return str.charAt(Math.floor(Math.random()*str.length));
}

// Main generator
function generatePassword(){
  const length = parseInt(lengthRange.value,10);
  const useLower = document.getElementById('lowercase').checked;
  const useUpper = document.getElementById('uppercase').checked;
  const useNumber = document.getElementById('numbers').checked;
  const useSymbol = document.getElementById('symbols').checked;
  const avoidAmbiguous = document.getElementById('avoidAmbiguous').checked;
  const includeSpaces = document.getElementById('includeSpaces').checked;

  let pool = '';
  const guaranteed = [];

  if(useLower){
    let s = CHARSETS.lower;
    if(avoidAmbiguous) s = s.replace(/[l]/g,'');
    pool += s;
    guaranteed.push(pickRandom(s));
  }
  if(useUpper){
    let s = CHARSETS.upper;
    if(avoidAmbiguous) s = s.replace(/[IO]/g,'');
    pool += s;
    guaranteed.push(pickRandom(s));
  }
  if(useNumber){
    let s = CHARSETS.number;
    if(avoidAmbiguous) s = s.replace(/[01]/g,'');
    pool += s;
    guaranteed.push(pickRandom(s));
  }
  if(useSymbol){
    let s = CHARSETS.symbol;
    if(avoidAmbiguous) s = s.replace(/[\[\]{}()\/\\'\"`.,]/g,'');
    pool += s;
    guaranteed.push(pickRandom(s));
  }
  if(includeSpaces){
    pool += ' ';
  }

  if(pool.length === 0){
    passwordEl.textContent = 'Select at least one character set.';
    updateStrength('');
    return;
  }

  // Build password array
  const pass = [];
  // ensure guaranteed chars included if possible
  for(let i=0;i<guaranteed.length && pass.length<length;i++) pass.push(guaranteed[i]);

  while(pass.length < length){
    pass.push(pickRandom(pool));
  }

  // Fisher–Yates shuffle
  for(let i=pass.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [pass[i],pass[j]] = [pass[j],pass[i]];
  }

  const final = pass.join('');
  passwordEl.textContent = final;
  updateStrength(final);
}

// Strength meter (simple estimator)
function updateStrength(pw){
  if(!pw){ strengthBar.style.width = '0%'; strengthText.textContent = ''; return; }
  let score = 0;
  score += Math.min(40, pw.length * 2); // length weight
  if(/[a-z]/.test(pw)) score += 15;
  if(/[A-Z]/.test(pw)) score += 15;
  if(/[0-9]/.test(pw)) score += 15;
  if(/[^A-Za-z0-9\s]/.test(pw)) score += 15;
  score = Math.min(100, score);
  strengthBar.style.width = score + '%';
  if(score < 40){ strengthBar.style.background = '#ef4444'; strengthText.textContent = 'Weak'; }
  else if(score < 70){ strengthBar.style.background = '#f59e0b'; strengthText.textContent = 'Okay'; }
  else { strengthBar.style.background = '#10b981'; strengthText.textContent = 'Strong'; }
}

// Clipboard copy with fallback
async function copyToClipboard(){
  const text = passwordEl.textContent;
  try{
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    setTimeout(()=> copyBtn.textContent = 'Copy',1200);
  }catch(e){
    // fallback
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand('copy'); copyBtn.textContent = 'Copied!'; setTimeout(()=> copyBtn.textContent='Copy',1200);}catch(err){ alert('Copy failed — select and copy manually.'); }
    ta.remove();
  }
}

// Download as .txt
function downloadTxt(){
  const blob = new Blob([passwordEl.textContent], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'password.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

// Toggle show/hide password (simple blur)
let shown = true;
eyeBtn.addEventListener('click', ()=>{
  shown = !shown;
  if(shown){ passwordEl.style.filter = 'none'; eyeBtn.textContent = 'Hide'; }
  else{ passwordEl.style.filter = 'blur(6px)'; eyeBtn.textContent = 'Show'; }
});

// Event listeners
generateBtn.addEventListener('click', generatePassword);
shuffleBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadTxt);

// Initial
lengthValue.textContent = lengthRange.value;
generatePassword();


