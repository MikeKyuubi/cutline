
/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const z = n => String(n).padStart(2,'0');
const ymd = d => d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate());
const parseYmd = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); };
const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate()+n); return ymd(d); };
const diffDays = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 864e5);
const today = () => ymd(new Date());
const clone = o => JSON.parse(JSON.stringify(o));
const r50 = n => Math.round(n/50)*50;
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* ---------- reference data ---------- */
const COFFEE = {
  gold:    {label:'Nescafé Gold + 1 tsp sugar + 1 tsp Coffee-mate', kcal:30},
  goldmilk:{label:'Nescafé Gold + 50 ml low-fat milk + stevia', kcal:25},
  black:   {label:'Black / Americano', kcal:5},
  milk:    {label:'With a splash of milk', kcal:30},
  sf3in1:  {label:'Sugar-free 3-in-1 sachet', kcal:50},
  '3in1':  {label:'Regular 3-in-1 sachet', kcal:110},
  latte:   {label:'Café latte (no syrup)', kcal:150},
};
const ACTIVITY = {1.3:'Desk / hotel, little walking', 1.4:'Light (some walking)', 1.55:'On your feet most of the day'};

// kcal and protein are typical estimates. tag: go = fits a cut, limit = OK occasionally, avoid = blows the budget
const FOODS = {
  ph: [
    ['ProMatrix 7 shake, 1 scoop in water',130,25,'go'],
    ['ProMatrix 7, ½ scoop in coffee',65,13,'go'],
    ['Grilled chicken breast (150 g)',250,45,'go'],
    ['Chicken inasal, paa — skin off',290,32,'go'],
    ['Inihaw na bangus, half',260,30,'go'],
    ['Sinigang na hipon (bowl)',180,20,'go'],
    ['Tinola (bowl, 2 pcs chicken)',230,26,'go'],
    ['Boiled eggs ×2 (7-Eleven)',140,12,'go'],
    ['Canned tuna in water (155 g)',150,30,'go'],
    ['Ginisang monggo (bowl)',250,15,'go'],
    ['Pinakbet (cup)',160,5,'go'],
    ['Half cup rice',100,2,'go'],
    ['1 cup rice',205,4,'limit'],
    ['Banana, lakatan',100,1,'go'],
    ['Low-fat milk 250 ml',120,8,'go'],
    ['Chicken adobo (2 pcs)',380,30,'limit'],
    ['Pork menudo (carinderia serving)',380,20,'limit'],
    ['Beef kaldereta (carinderia serving)',430,24,'limit'],
    ['Grilled chicken liver, 3 skewers',180,24,'go'],
    ['Pandesal ×2',180,6,'limit'],
    ['Taho, small',150,6,'limit'],
    ['Mang Inasal PM1 + 1 rice',600,34,'limit'],
    ['Jollibee 1-pc Chickenjoy + rice',560,30,'limit'],
    ['Starbucks matcha latte, tall, nonfat milk',150,9,'limit'],
    ['Starbucks matcha latte, grande, 2% milk',240,12,'limit'],
    ['Starbucks matcha Frappuccino, grande',420,6,'avoid'],
    ['7-Eleven grilled liempo + kangkong meal',839,16,'avoid'],
    ['Pork sisig (serving)',550,25,'avoid'],
    ['Lechon kawali (150 g)',650,28,'avoid'],
    ['Extra rice (unli-rice round)',205,4,'avoid'],
  ],
  tw: [
    ['7-Eleven sous-vide chicken breast',120,24,'go'],
    ['Tea eggs ×2',150,13,'go'],
    ['Unsweetened soy milk 400 ml',140,14,'go'],
    ['Roasted sweet potato, medium',180,3,'go'],
    ['Convenience-store salad + chicken',260,22,'go'],
    ['Guava',70,2,'go'],
    ['Tuna onigiri',190,6,'limit'],
    ['Buffet bento: half rice, 3 veg, 1 lean meat',550,30,'limit'],
    ['Beef noodle soup (clear, leave half noodles)',480,32,'limit'],
    ['Lu rou fan, small',450,12,'avoid'],
    ['Fried chicken cutlet (ji pai)',600,30,'avoid'],
    ['Bubble milk tea, full sugar',450,4,'avoid'],
    ['Starbucks matcha latte, grande, 2% milk',240,12,'limit'],
  ],
  hotel: [
    ['ProMatrix 7 shake, 1 scoop in water',130,25,'go'],
    ['Hotel breakfast: 3-egg omelette, veg',260,20,'go'],
    ['Hotel breakfast: 2 boiled eggs + fruit',220,13,'go'],
    ['Grilled fish fillet (150 g)',220,35,'go'],
    ['Room-service grilled chicken salad',400,38,'go'],
    ['Greek / plain yogurt cup',120,12,'go'],
    ['Oatmeal bowl, no sugar',200,7,'go'],
    ['Toast with butter ×2',260,6,'limit'],
    ['Pancakes + syrup (3)',520,10,'avoid'],
    ['Club sandwich + fries',900,35,'avoid'],
  ],
};
const REGION_LABEL = {ph:'Philippines (carinderia, fast food, 7-Eleven)', tw:'Taiwan (7-Eleven / FamilyMart, buffet bento)', hotel:'Hotel buffet / room service'};

const EX = {
  goblet:{name:'Goblet squat',sets:'3 × 10–12',vest:true,
    steps:['Hold the dumbbell upright against your chest, both hands cupping the top end.','Feet shoulder-width, toes turned out a little.','Sit down between your heels until thighs reach parallel or lower; elbows travel inside the knees.','Stand by pushing through the whole foot and squeeze your glutes at the top.'],
    cue:'Chest tall, knees follow the toes, take 3 seconds on the way down.',miss:'Heels lifting, knees caving in, lower back rounding at the bottom.'},
  floorpress:{name:'One-arm floor press',sets:'3 × 10 per arm',
    steps:['Lie on your back, knees bent, dumbbell in one hand; upper arm on the floor about 45° from your body.','Press straight up over the shoulder to a locked elbow.','Lower slowly until the upper arm touches the floor. Pause 1 second.','Keep your free hand on your stomach and stay braced.'],
    cue:'Do not let your body roll toward the weight.',miss:'Elbow flared out at 90°, bouncing the elbow off the floor.'},
  row:{name:'One-arm row',sets:'3 × 10–12 per arm',
    steps:['Put one hand and the same-side knee on the bed or a solid chair. Back flat, roughly parallel to the floor.','Let the dumbbell hang straight under your shoulder.','Pull your elbow back toward your hip, like starting a lawnmower.','Lower under control until the arm is straight.'],
    cue:'Pull with your back, not your biceps. No twisting.',miss:'Jerking the weight up, shrugging the shoulder toward your ear.'},
  revlunge:{name:'Reverse lunge',sets:'3 × 8 per leg',vest:true,
    steps:['Stand tall, dumbbell at your chest or in one hand at your side.','Step one foot back about 60 cm and lower the back knee toward the floor.','Front shin stays close to vertical. Back knee stops just above the floor.','Push through the front heel to return to standing.'],
    cue:'Torso upright, most weight on the front foot.',miss:'Steps too short, so the front knee shoots forward; hips wobbling.'},
  plank:{name:'Plank',sets:'3 × 30–45 s',vest:true,
    steps:['Forearms on the floor, elbows under your shoulders.','Legs straight, up on your toes. Straight line from head to heels.','Squeeze your glutes and brace your abs as if someone will punch your stomach.','Breathe slowly. End the set when your hips start to sag.'],
    cue:'Ribs down, glutes tight.',miss:'Hips sagging or piked up, holding your breath.'},
  rdl:{name:'Romanian deadlift',sets:'3 × 10–12',vest:true,
    steps:['Stand holding the dumbbell with both hands in front of your thighs, knees slightly bent.','Push your hips back and slide the weight down the front of your legs.','Stop when you feel a strong stretch in the hamstrings, around mid-shin. Back stays flat.','Drive your hips forward to stand and squeeze your glutes.'],
    cue:'It is a hinge, not a squat. Keep the weight touching your legs.',miss:'Rounding the back, bending the knees into a squat.'},
  pushup:{name:'Push-up (vest on)',sets:'3 × (max − 2)',vest:true,
    steps:['Hands slightly wider than shoulders, body straight from head to heels.','Lower until your chest is a fist away from the floor, elbows about 45° from your body.','Push the floor away to full lockout.','Too hard with the vest? Take it off or put your hands on the bed.'],
    cue:'Stop every set 2 reps before you would fail.',miss:'Hips sagging, elbows flared wide, half reps.'},
  ohp:{name:'One-arm overhead press',sets:'3 × 8 per arm',
    steps:['Stand with the dumbbell at your shoulder, palm facing in. Glutes and abs tight.','Press straight up until your arm is beside your ear.','Lower slowly back to the shoulder.','Free hand on your hip. Do not lean away from the weight.'],
    cue:'Squeeze your glutes so your lower back does not arch.',miss:'Leaning back to finish the rep.'},
  splitsq:{name:'Bulgarian split squat',sets:'3 × 8 per leg',
    steps:['Stand about two steps in front of the bed or a chair and rest the top of your back foot on it.','Hold the dumbbell at your chest.','Lower straight down until the front thigh is near parallel.','Push through the front heel to stand.'],
    cue:'Most of your weight on the front leg. A slight forward lean is fine.',miss:'Standing too close to the bed, front heel lifting.'},
  deadbug:{name:'Dead bug',sets:'3 × 8 per side',
    steps:['Lie on your back, arms pointing at the ceiling, hips and knees bent to 90°.','Press your lower back flat into the floor.','Slowly reach the opposite arm and leg toward the floor.','Return and switch sides. Your lower back never lifts.'],
    cue:'Breathe out as you reach.',miss:'Going fast, lower back arching off the floor.'},
};
const WORKOUTS = {A:['goblet','floorpress','row','revlunge','plank'], B:['rdl','pushup','ohp','splitsq','deadbug']};
const LIFT_DAYS = [1,3,5]; // Mon Wed Fri

/* ---------- state ---------- */
const DEFAULT_PROFILE = {age:30, sex:'m', heightCm:167, startKg:74, goalKg:69, startDate:today(),
  activity:1.3, vestKg:10, coffeeType:'gold', region:'ph', location:'', adjust:0, penalties:true,
  waterRemind:false, remindEvery:60, wakeHour:7, sleepHour:22};
let profile = clone(DEFAULT_PROFILE);
let days = {};
let mode = 'local';
let refs = null;
let sample = null;
let activeTab = 'today';
try { const s = JSON.parse(localStorage.getItem('cut69') || 'null'); if (s) { profile = {...profile, ...s.profile}; days = s.days || {}; } } catch {}
try { const t = localStorage.getItem('cut69tab'); if (t) activeTab = t; } catch {}

const emptyDay = date => ({date, weight:null, foods:[], coffee:0, water:0, waterAt:null, ruckMin:0, ruckStart:null, workoutDone:[]});
const getDay = date => days[date] || emptyDay(date);
const ensureDay = date => (days[date] ||= emptyDay(date));

function saveLocal(){ try { localStorage.setItem('cut69', JSON.stringify({profile, days})); } catch {} }

/* Apple Health data arrives from an iPhone Shortcut via the ingest_health database function */
const STEP_GOAL = 10000;
let health = {}, healthToken = null;
try { health = JSON.parse(localStorage.getItem('cut69health') || '{}') || {}; healthToken = localStorage.getItem('cut69htok'); } catch {}
function saveHealthLocal(){ try { localStorage.setItem('cut69health', JSON.stringify(health)); if (healthToken) localStorage.setItem('cut69htok', healthToken); else localStorage.removeItem('cut69htok'); } catch {} }
function applyHealthWeights(){
  // a weight logged in Apple Health (smart scale or manual) fills an empty morning weigh-in
  const cutoff = addDays(today(), -14);
  Object.values(health).forEach(h => {
    const w = parseFloat(h.weight_kg);
    if (h.date >= cutoff && w > 30 && w < 200 && !getDay(h.date).weight) { ensureDay(h.date).weight = Math.round(w*10)/10; saveDay(h.date); }
  });
}

/* sync: every change is saved locally first, then pushed to Supabase; unsent keys survive restarts */
let sb = null, uid = null, userEmail = '', syncError = null, flushing = false;
const timers = {}, ver = {};
let dirty = new Set();
try { dirty = new Set(JSON.parse(localStorage.getItem('cut69dirty') || '[]')); } catch {}
const persistDirty = () => { try { localStorage.setItem('cut69dirty', JSON.stringify([...dirty])); } catch {} };
function markDirty(key){
  dirty.add(key); persistDirty(); ver[key] = (ver[key]||0) + 1;
  clearTimeout(timers[key]); timers[key] = setTimeout(flush, 600);
  setSync();
}
async function pushKey(key){
  const now = new Date().toISOString();
  const date = key.slice(2);
  const r = key === 'profile'
    ? await sb.from('profiles').upsert({user_id: uid, data: profile, updated_at: now})
    : await sb.from('days').upsert({user_id: uid, date, data: days[date] || emptyDay(date), updated_at: now});
  if (r.error) { syncError = r.error.message; return false; }
  syncError = null; return true;
}
async function flush(){
  if (flushing || !sb || !uid || !navigator.onLine) { setSync(); return; }
  flushing = true; setSync();
  try {
    for (const key of [...dirty]) {
      const v = ver[key];
      let ok = false;
      try { ok = await pushKey(key); } catch (e) { syncError = String((e && e.message) || e); }
      if (!ok) break;
      if (ver[key] === v) { dirty.delete(key); persistDirty(); }
    }
  } finally {
    flushing = false; setSync();
    if (dirty.size && !syncError) setTimeout(flush, 300);
  }
}
setInterval(() => { if (dirty.size) flush(); }, 30000);
addEventListener('online', () => { flush().then(pull); });
addEventListener('offline', () => setSync());
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && uid) flush().then(pull); });

function saveDay(date){
  saveLocal();
  if (uid) markDirty('d:'+date);
  render();
}
function saveProfile(){
  saveLocal();
  if (uid) markDirty('profile');
  render();
}
function setSync(){
  const pill = $('#syncPill'), t = $('#syncText');
  if (!pill) return;
  pill.className = 'pill';
  if (uid) {
    if (!navigator.onLine) { pill.classList.add('warn'); t.textContent = dirty.size ? 'Offline, will sync later' : 'Offline'; }
    else if (syncError) { pill.classList.add('bad'); t.textContent = 'Sync error, saved on this device'; }
    else if (dirty.size) { pill.classList.add('warn'); t.textContent = 'Saving…'; }
    else { pill.classList.add('ok'); t.textContent = 'Synced'; }
  } else { pill.classList.add('warn'); t.textContent = 'This device only'; }
}

/* ---------- the numbers ---------- */
function latestWeight(upTo){
  const ds = Object.keys(days).filter(d => d <= upTo && days[d].weight).sort();
  return ds.length ? days[ds[ds.length-1]].weight : profile.startKg;
}
function bmr(w){ return 10*w + 6.25*profile.heightCm - 5*profile.age + (profile.sex === 'f' ? -161 : 5); }
function targets(date){
  const w = latestWeight(date);
  const maint = bmr(w) * Number(profile.activity);
  const atGoal = w <= profile.goalKg;
  const kcal = atGoal ? r50(maint + 150) : Math.max(1500, r50(maint - 500 + Number(profile.adjust||0)));
  const protein = Math.round(w * 1.8 / 5) * 5;
  return {w, maint:Math.round(maint), kcal, protein, atGoal};
}
const coffeeKcal = () => (COFFEE[profile.coffeeType] || COFFEE.black).kcal;
function dayTotals(d){
  const food = d.foods.reduce((a,f) => a + (+f.kcal||0), 0);
  const protein = d.foods.reduce((a,f) => a + (+f.protein||0), 0);
  const coffee = d.coffee * coffeeKcal();
  return {food, protein, coffee, total: food + coffee};
}
const ruckRate = w => (5.5 - 1) * 3.5 * (w + Number(profile.vestKg||0)) / 200; // net kcal/min, loaded brisk walk
function ruckBase(date){
  const wk = Math.floor(Math.max(0, diffDays(profile.startDate, date)) / 7);
  if (parseYmd(date).getDay() === 0) return {min:30, vest:false};
  return {min:[45,50,60][Math.min(wk,2)], vest:true};
}
function ruckPlan(date){
  const p = {...ruckBase(date), why:[]};
  const y = addDays(date, -1);
  if (profile.penalties && y >= profile.startDate && date <= today()) {
    const yd = getDay(y);
    if (yd.foods.length) {
      const over = dayTotals(yd).total - targets(y).kcal;
      if (over > 150) { p.min += 15; p.why.push(`+15 min: yesterday was ${over} kcal over`); }
    }
    const owed = ruckBase(y).min - (yd.ruckMin||0);
    if (owed > 0) { const add = Math.min(20, owed); p.min += add; p.why.push(`+${add} min: yesterday's ruck was short`); }
    p.min = Math.min(p.min, 90);
  }
  return p;
}
function liftSession(date){
  const dow = parseYmd(date).getDay();
  if (!LIFT_DAYS.includes(dow)) return null;
  let n = 0;
  for (let d = profile.startDate; d < date; d = addDays(d,1)) if (LIFT_DAYS.includes(parseYmd(d).getDay())) n++;
  return n % 2 ? 'B' : 'A';
}
function waterGoal(date){
  const base = Math.round(targets(date).w * 35 / 250) * 250;
  const extra = Math.round((getDay(date).ruckMin || 0) / 60 * 500 / 250) * 250;
  return base + extra;
}
function waterDue(){
  if (!profile.waterRemind) return false;
  const now = new Date(), h = now.getHours();
  if (h < Number(profile.wakeHour) || h >= Number(profile.sleepHour)) return false;
  const d = getDay(today());
  if ((d.water || 0) >= waterGoal(today())) return false;
  const wake = new Date(); wake.setHours(Number(profile.wakeHour), 0, 0, 0);
  const last = Math.max(d.waterAt || 0, wake.getTime());
  return Date.now() - last >= Number(profile.remindEvery) * 60000;
}
let lastNotified = 0;
function notifyWater(){
  const left = waterGoal(today()) - (getDay(today()).water || 0);
  const body = `Time for a glass of water. ${left} ml to go today.`;
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(r => r.showNotification('Drink water', {body, icon:'icons/icon-192.png', tag:'water', renotify:true}));
    } else new Notification('Drink water', {body, tag:'water'});
  } catch {}
}
setInterval(() => {
  if (!waterDue()) return;
  if (Date.now() - lastNotified >= Number(profile.remindEvery) * 60000) { lastNotified = Date.now(); notifyWater(); }
  renderToday();
}, 60000);
async function enableReminders(){
  let perm = 'unsupported';
  try { if ('Notification' in window) perm = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission; } catch {}
  profile.waterRemind = true; saveProfile();
  return perm;
}

function verdict(date){
  const d = getDay(date), t = targets(date), tot = dayTotals(d), rp = ruckPlan(date), ls = liftSession(date);
  const isToday = date === today();
  const st = (ok, open) => ok ? 'ok' : (isToday && open ? 'open' : 'bad');
  const items = [
    {k:'kcal', label:`Eat ≤ ${t.kcal} kcal`, val:`${tot.total}`, s: tot.total > t.kcal + 50 ? 'bad' : (d.foods.length ? (isToday ? 'open' : 'ok') : st(false,true))},
    {k:'protein', label:`Protein ≥ ${t.protein} g`, val:`${tot.protein} g`, s: st(tot.protein >= t.protein*0.85, true)},
    {k:'ruck', label: rp.vest ? `Ruck ${rp.min} min with vest` : `Recovery walk ${rp.min} min, no vest`, val:`${d.ruckMin||0} min`, s: st((d.ruckMin||0) >= rp.min, true)},
    ls ? {k:'lift', label:`Dumbbell session ${ls}`, val:`${(d.workoutDone||[]).filter(x=>WORKOUTS[ls].includes(x)).length}/5`, s: st(WORKOUTS[ls].every(x => (d.workoutDone||[]).includes(x)), true)}
       : {k:'lift', label:'No lifting today — 10 min stretching', val:'rest', s:'ok'},
    {k:'weigh', label:'Morning weigh-in', val: d.weight ? d.weight.toFixed(1)+' kg' : '—', s: st(!!d.weight, true)},
    ...(healthToken && (isToday || health[date]) ? [{k:'steps', label:`Walk ${STEP_GOAL.toLocaleString()} steps`, val: health[date] ? Number(health[date].steps||0).toLocaleString() : '—', s: st(Number((health[date]||{}).steps||0) >= STEP_GOAL, true)}] : []),
    {k:'water', label:`Drink ${(waterGoal(date)/1000).toFixed(1)} L water`, val:`${((d.water||0)/1000).toFixed(2)} L`, s: st((d.water||0) >= waterGoal(date), true)},
  ];
  // a finished day with food logged under budget passes kcal
  if (!isToday && d.foods.length && tot.total <= t.kcal + 50) items[0].s = 'ok';
  const passed = items.every(i => i.s === 'ok');
  return {items, passed, failed: items.some(i => i.s === 'bad'), t, tot, rp, ls};
}
function streak(){
  let n = 0, d = today();
  if (!verdict(d).passed) d = addDays(d, -1);
  while (d >= profile.startDate && verdict(d).passed) { n++; d = addDays(d, -1); }
  return n;
}
const planWeight = date => Math.max(profile.goalKg, profile.startKg - 0.1 * Math.max(0, diffDays(profile.startDate, date)));
function avgWeight(date, n=7){
  const ws = [];
  for (let i=0;i<n;i++){ const w = getDay(addDays(date,-i)).weight; if (w) ws.push(w); }
  return ws.length ? ws.reduce((a,b)=>a+b,0)/ws.length : null;
}

/* ---------- render ---------- */
const MARK = {ok:'✓', bad:'✕', open:''};
let suggestHTML = '', estHTML = '', estItems = [], setupDirty = false;
function render(){
  const ae = document.activeElement;
  const keep = ae && ae.id && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) ? [ae.id, ae.value] : null;
  const vals = {}; ['mealIn','cfName','cfKcal','cfProt','locIn'].forEach(id => { const el = document.getElementById(id); if (el) vals[id] = el.value; });
  render0();
  Object.entries(vals).forEach(([id,v]) => { const el = document.getElementById(id); if (el) el.value = v; });
  if (keep) { const el = document.getElementById(keep[0]); if (el) { el.value = keep[1]; el.focus(); } }
}
function render0(){
  $('#hdrSub').textContent = `${latestWeight(today()).toFixed(1)} → ${Number(profile.goalKg).toFixed(1)} kg`;
  renderToday(); renderTrain(); renderFood(); renderProgress(); if (!setupDirty) renderSetup(); setSync();
}

function coachLine(v, d){
  const h = new Date().getHours();
  const left = v.t.kcal - v.tot.total, pLeft = v.t.protein - v.tot.protein;
  if (v.t.atGoal) return ['ok', `You are at ${profile.goalKg} kg. Target is now maintenance (${v.t.kcal} kcal). Keep rucking, keep logging.`];
  if (left < -50) return ['bad', `Over by ${-left} kcal. Kitchen is closed for today.${profile.penalties ? ' Tomorrow\'s ruck gets +15 min.' : ''}`];
  const avg = avgWeight(today()), dayN = diffDays(profile.startDate, today());
  if (dayN >= 10 && avg && avg - planWeight(today()) > 0.6) return ['bad', `7-day average ${avg.toFixed(1)} kg is ${(avg - planWeight(today())).toFixed(1)} kg behind plan. Tighten up: cut 150 kcal (Setup) and stop guessing portions.`];
  if (v.rp.min > (d.ruckMin||0) && h >= 18) return ['bad', v.rp.vest
    ? `Ruck still owed: ${v.rp.min - (d.ruckMin||0)} min. Put the vest on and go now.`
    : `Recovery walk still owed: ${v.rp.min - (d.ruckMin||0)} min. Easy pace, no vest. Go now.`];
  if (!d.foods.length && h >= 11) return ['', 'Nothing logged yet. Log every bite as you eat it, not at night from memory.'];
  if (left < 250 && h < 17) return ['', `Only ${Math.max(left,0)} kcal left before dinner. Protein and vegetables only from here.`];
  if (pLeft > 40 && h >= 15) return ['', `${pLeft} g protein still to go. Next meal: chicken, fish, eggs or tuna first.`];
  return ['ok', `${left} kcal and ${Math.max(pLeft,0)} g protein left. Protein first, rice last.`];
}

const CUP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z"/><path d="M16 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 3v2M12 3v2"/></svg>';

function renderToday(){
  const date = today(), d = getDay(date), v = verdict(date);
  const [ctone, cline] = coachLine(v, d);
  const foodBudget = v.t.kcal - 3*coffeeKcal();
  const pct = Math.min(100, v.tot.total / v.t.kcal * 100);
  const ppct = Math.min(100, v.tot.protein / v.t.protein * 100);
  const running = d.ruckStart ? Math.floor((Date.now() - d.ruckStart)/60000) : 0;
  const ls = v.ls;
  const status = v.passed ? ['ok','ON PLAN'] : v.failed ? ['bad','OFF PLAN'] : ['warn','IN PROGRESS'];
  const wg = waterGoal(date), wml = d.water || 0;
  const sinceDrink = d.waterAt ? Math.round((Date.now() - d.waterAt) / 60000) : null;
  let notifState = 'unsupported';
  try { if ('Notification' in window) notifState = Notification.permission; } catch {}
  $('#tab-today').innerHTML = `
  ${waterDue() ? `<div class="coach bad">Drink water now: one glass (250 ml). ${sinceDrink == null ? 'Nothing logged yet today.' : `Last glass ${sinceDrink} min ago.`} <button class="btn" data-water="250" style="margin-left:6px">Done +250 ml</button></div>` : ''}
  <div class="card">
    <div class="spread"><h2>Orders · ${DOW[parseYmd(date).getDay()]} ${date.slice(5)}</h2>
      <span class="pill ${status[0]}"><span class="dot"></span>${status[1]}</span></div>
    <ul class="orders">${v.items.map(i => `<li data-jump="${i.k}" role="button" tabindex="0"><span class="mark ${i.s}">${MARK[i.s]}</span><span>${esc(i.label)}</span><span class="num small muted">${esc(i.val)} ›</span></li>`).join('')}</ul>
    <div class="small muted">Boxes tick themselves when you log. Tap an order to go to where you log it.</div>
    ${v.rp.why.length ? `<div class="small" style="color:var(--bad)">${v.rp.why.map(esc).join(' · ')}</div>` : ''}
    <div class="coach ${ctone}">${esc(cline)}</div>
    <div class="small muted">Streak: <b class="num">${streak()}</b> day(s) fully on plan.</div>
  </div>

  <div class="grid2">
    <div class="card">
      <div class="label">Calories left today</div>
      <div class="spread"><span class="big num" style="color:${v.tot.total > v.t.kcal ? 'var(--bad)' : 'var(--ink)'}">${v.t.kcal - v.tot.total}</span><span class="small muted num">${v.tot.total} / ${v.t.kcal}</span></div>
      <div class="bar ${v.tot.total > v.t.kcal ? 'over':''}"><i style="width:${pct}%"></i></div>
      <div class="label">Protein</div>
      <div class="spread"><span class="num" style="font-weight:600">${v.tot.protein} g</span><span class="small muted num">target ${v.t.protein} g</span></div>
      <div class="bar"><i style="width:${ppct}%"></i></div>
      <div class="small muted">Food budget after 3 coffees: <span class="num">${foodBudget}</span> kcal.</div>
    </div>
    <div class="card">
      <div class="label">Coffee · 3 a day, already budgeted</div>
      <div class="cups">${[0,1,2].map(i => `<button class="cup ${d.coffee > i ? 'on':''}" data-cup="${i}" aria-label="Coffee ${i+1}">${CUP}</button>`).join('')}
        ${d.coffee > 3 ? `<span class="pill bad">+${d.coffee-3} extra</span>` : ''}</div>
      <div class="small muted">${esc(COFFEE[profile.coffeeType].label)} · ${coffeeKcal()} kcal each. ${coffeeKcal() >= 100 ? 'Switching to sugar-free sachets frees up about ' + (3*(coffeeKcal()-50)) + ' kcal a day.' : ''}</div>
      <div class="row"><button class="btn ghost" data-act="coffee-extra">+ extra cup</button>${d.coffee ? '<button class="btn ghost" data-act="coffee-undo">undo</button>':''}</div>
      <div class="label">Morning weight</div>
      <form class="row" id="wForm"><input id="wIn" type="number" step="0.1" min="30" max="200" inputmode="decimal" placeholder="kg" value="${d.weight ?? ''}" style="width:110px"><button class="btn primary" type="submit">Save</button></form>
      <div class="small muted">Weigh after the toilet, before food or coffee. Daily numbers jump ±1 kg from water; the 7-day average is what counts.</div>
    </div>
  </div>

  ${uid ? activityCard(date) : ''}

  <div class="card" id="cardWater">
    <div class="spread"><h3>Water</h3><span class="num small muted">${wml} / ${wg} ml</span></div>
    <div class="bar"><i style="width:${Math.min(100, wml / wg * 100)}%;background:var(--accent)"></i></div>
    <div class="row"><button class="btn primary" data-water="250">+ Glass 250 ml</button><button class="btn" data-water="500">+ Bottle 500 ml</button><button class="btn ghost" data-water="-250">−250</button></div>
    <div class="small muted">Goal is 35 ml per kg of body weight plus 500 ml per hour of rucking. Coffee doesn't count toward it.
      ${profile.waterRemind
        ? `Reminders every ${profile.remindEvery} min, ${profile.wakeHour}:00–${profile.sleepHour}:00${notifState === 'granted' ? ' (notifications on)' : notifState === 'denied' ? '. Notifications are blocked in this browser, so you will only see the reminder inside the app' : ', inside the app'}.`
        : '<button class="btn" data-act="remind-on" style="margin-top:6px">Turn on drink reminders</button>'}</div>
  </div>

  <div class="card" id="cardRuck">
    <div class="spread"><h3>${v.rp.vest ? 'Ruck' : 'Recovery walk · no vest'}</h3><span class="num small muted">${d.ruckMin||0} / ${v.rp.min} min · ≈${Math.round((d.ruckMin||0) * ruckRate(v.t.w))} kcal burned</span></div>
    <div class="bar"><i style="width:${Math.min(100,(d.ruckMin||0)/v.rp.min*100)}%"></i></div>
    <div class="row">
      ${d.ruckStart ? `<span class="timer" id="ruckClock">${running}:00</span><button class="btn primary" data-act="ruck-stop">Stop & log</button>`
                   : `<button class="btn primary" data-act="ruck-start">Start ${v.rp.vest ? 'ruck' : 'walk'} timer</button>`}
      <button class="btn" data-ruck="15">+15</button><button class="btn" data-ruck="30">+30</button><button class="btn" data-ruck="-15">−15</button>
    </div>
    <div class="small muted">The timer runs on any device: start it on your phone, stop it on your laptop. Ruck burn is not added back to your food budget.</div>
  </div>

  <div class="card">
    <div class="spread"><h3>${ls ? 'Dumbbell session ' + ls : 'No lifting today'}</h3><button class="btn" data-goto="train">${ls ? 'Open session' : 'See plan'}</button></div>
    ${ls ? `<div class="small muted">${WORKOUTS[ls].map(x => (d.workoutDone||[]).includes(x) ? '✓ ' + EX[x].name : EX[x].name).map(esc).join(' · ')}</div>` : '<div class="small muted">Rest the muscles. 10 minutes of stretching after your ruck.</div>'}
  </div>

  <div class="card">
    <div class="spread"><h3>Eaten today</h3><button class="btn primary" data-goto="food">+ Add food</button></div>
    ${d.foods.length ? `<ul class="log">${d.foods.map((f,i) => `<li><span class="nm">${esc(f.name)}</span><span class="num small">${f.kcal} kcal · ${f.protein} g</span><button class="btn ghost" data-delfood="${i}" aria-label="Remove">✕</button></li>`).join('')}</ul>`
      : '<div class="muted small">Nothing logged yet. Tap Add food and log meals as you eat them.</div>'}
  </div>`;
}

function renderTrain(){
  const date = today(), d = getDay(date), ls = liftSession(date), rp = ruckPlan(date);
  const t = targets(date);
  const monday = addDays(date, -((parseYmd(date).getDay()+6)%7));
  const week = [...Array(7)].map((_,i) => addDays(monday, i));
  const sess = ls || 'A';
  $('#tab-train').innerHTML = `
  <div class="card">
    <h2>This week</h2>
    <div class="week">${week.map(w => { const l = liftSession(w); const r = ruckBase(w);
      return `<div class="${w===date?'today':''}"><span class="muted">${DOW[parseYmd(w).getDay()]}</span><b>${l ? 'Lift ' + l : 'Rest'}</b><span class="num">${r.vest ? 'Ruck ' + r.min : 'Walk ' + r.min}</span></div>`; }).join('')}</div>
    <div class="small muted">Lift Mon / Wed / Fri, alternating A and B. Ruck every day except Sunday, which is an easy walk without the vest.</div>
  </div>

  <div class="card">
    <div class="spread"><h2>${ls ? 'Today: session ' + ls : 'Preview: session A'}</h2><span class="small muted">~35 min · 10 kg dumbbell</span></div>
    <div class="small"><b>Warm-up, 5 min:</b> 20 arm circles, 15 bodyweight squats, 10 hip hinges, 10 slow lunges, 30 s march in place.</div>
    <div class="small"><b>Rules:</b> rest 60–90 s between sets. When you can do the top of the rep range on all 3 sets with good form, put the vest on for that exercise (marked VEST) or slow the lowering to 4 seconds.</div>
    ${WORKOUTS[sess].map(x => exCard(x, d, !!ls)).join('')}
    <div class="row"><span class="timer" id="restClock">0:00</span><button class="btn" data-rest="60">Rest 60 s</button><button class="btn" data-rest="90">Rest 90 s</button><button class="btn ghost" data-rest="0">Stop</button></div>
  </div>

  <div class="card">
    <h2>Session ${ls === 'B' ? 'A' : 'B'} (next time)</h2>
    ${WORKOUTS[ls === 'B' ? 'A' : 'B'].map(x => exCard(x, d, false)).join('')}
  </div>

  <div class="card">
    <h2>Rucking with the vest</h2>
    <ul class="small" style="margin:0;padding-left:18px;display:grid;gap:6px">
      <li><b>Today: ${rp.min} min ${rp.vest ? 'with vest' : 'without vest'}.</b> Week 1 is 45 min a day, week 2 is 50, week 3 onward is 60. That burns roughly ${Math.round(60*ruckRate(t.w))} kcal per hour at your weight with a ${profile.vestKg} kg vest.</li>
      <li><b>Pace:</b> brisk, about 5–6 km/h. You can talk in short sentences but would not want to sing. Do not run with the vest.</li>
      <li><b>Vest weight:</b> start around 10% of body weight (7–8 kg). Your ${profile.vestKg} kg vest is ${Math.round(profile.vestKg / t.w * 100)}% of body weight. ${profile.vestKg / t.w > 0.15 ? 'That is heavy for daily rucking; remove some plates for the first two weeks.' : 'That is fine to work up to; if feet or knees ache in week 1, go without it for a few days.'}</li>
      <li><b>Splitting is fine:</b> 2 × 30 min counts the same as 60 min straight. Hotel stairs count too.</li>
      <li><b>Lift days:</b> lift first, ruck later in the day.</li>
      <li><b>Stop</b> for sharp pain in knees, back or feet (normal muscle tiredness is fine). Wear proper shoes, keep the vest snug and high on the chest.</li>
    </ul>
  </div>`;
}
function activityCard(date){
  const h = health[date];
  if (!healthToken) return `<div class="card"><div class="spread"><h3>Activity</h3><button class="btn" data-goto="setup">Connect Apple Health</button></div><div class="small muted">Pull steps, distance, active calories and weight from your iPhone automatically.</div></div>`;
  if (!h) return `<div class="card"><h3>Activity</h3><div class="small muted">No Apple Health data yet today. It arrives when the Cutline Health shortcut runs (automatically at the times you set, or tap it on your iPhone).</div></div>`;
  const steps = Number(h.steps || 0);
  const at = h.updated_at ? new Date(h.updated_at) : null;
  return `<div class="card" id="cardActivity">
    <div class="spread"><h3>Activity · Apple Health</h3><span class="small muted">${at ? 'updated ' + z(at.getHours()) + ':' + z(at.getMinutes()) : ''}</span></div>
    <div class="spread"><span class="big num">${steps.toLocaleString()}</span><span class="small muted num">/ ${STEP_GOAL.toLocaleString()} steps</span></div>
    <div class="bar"><i style="width:${Math.min(100, steps / STEP_GOAL * 100)}%"></i></div>
    <div class="small muted num">${h.distance_km != null ? Number(h.distance_km).toFixed(1) + ' km · ' : ''}${h.active_kcal != null ? Math.round(h.active_kcal) + ' active kcal (not added to your food budget)' : ''}${h.weight_kg ? ' · Health weight ' + Number(h.weight_kg).toFixed(1) + ' kg' : ''}</div>
  </div>`;
}
function exCard(id, d, checkable){
  const e = EX[id], done = (d.workoutDone||[]).includes(id);
  const q = encodeURIComponent(e.name.replace(/\(.*\)/,'') + ' dumbbell form');
  return `<details class="ex"><summary>
      ${checkable ? `<input type="checkbox" class="chk" data-ex="${id}" ${done ? 'checked':''} aria-label="Done: ${esc(e.name)}">` : '<span></span>'}
      <span><b>${esc(e.name)}</b> ${e.vest ? '<span class="tag">vest</span>' : ''}<br><span class="small muted num">${esc(e.sets)}</span></span>
      <span class="small muted">How to ▾</span></summary>
    <div class="body small">
      <ol>${e.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      <div><b>Key cue:</b> ${esc(e.cue)}</div>
      <div><b>Common mistakes:</b> ${esc(e.miss)}</div>
      <div><a class="btn" href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">Watch demos on YouTube ↗</a></div>
    </div></details>`;
}

let foodQuery = '';
function renderFood(){
  const date = today(), v = verdict(date), left = v.t.kcal - v.tot.total, pLeft = Math.max(0, v.t.protein - v.tot.protein);
  const list = (FOODS[profile.region] || FOODS.ph).filter(f => f[0].toLowerCase().includes(foodQuery.toLowerCase()));
  $('#tab-food').innerHTML = `
  <div class="card">
    <div class="spread"><h2>Add food</h2><span class="num small">${left} kcal · ${pLeft} g protein left</span></div>
    <div class="row"><select id="regionSel" style="width:auto">${Object.keys(FOODS).map(k => `<option value="${k}" ${k===profile.region?'selected':''}>${esc(REGION_LABEL[k])}</option>`).join('')}</select>
      <input id="foodSearch" type="search" placeholder="Filter…" value="${esc(foodQuery)}" style="flex:1"></div>
    <div class="foods">${list.map((f,i) => `<button class="food" data-addfood="${esc(f[0])}|${f[1]}|${f[2]}"><span class="fn">${esc(f[0])}</span><span class="fk">${f[1]}</span><span class="fp">${f[2]} g protein · <span class="tag ${f[3]}">${f[3]}</span>${f[1] > left ? ' · <b style="color:var(--bad)">over your remaining budget</b>' : ''}</span></button>`).join('') || '<div class="muted small">No match.</div>'}</div>
    <div class="note">Values are typical estimates. Tap to log one serving.</div>
  </div>

  <div class="card">
    <h3>Custom entry</h3>
    <form id="customFood" class="fields">
      <label class="field"><span class="label">Food</span><input id="cfName" required placeholder="e.g. 2 pcs pork BBQ"></label>
      <label class="field"><span class="label">kcal</span><input id="cfKcal" type="number" min="0" required inputmode="numeric"></label>
      <label class="field"><span class="label">Protein g</span><input id="cfProt" type="number" min="0" value="0" inputmode="numeric"></label>
      <div class="field" style="align-self:end"><button class="btn primary" type="submit">Log it</button></div>
    </form>
  </div>

  <div class="card" id="aiCard">
    <h3>Ask Claude</h3>
    ${sample ? '' : '<div class="coach">Add your Anthropic API key in <b>Setup</b> to turn on food suggestions and meal estimates.</div>'}
    <label class="field"><span class="label">Where are you? (city, hotel or street — used only for this question)</span>
      <input id="locIn" value="${esc(profile.location)}" placeholder="e.g. Makati near Ayala, or Kaohsiung Zuoying"></label>
    <div class="row"><button class="btn primary" data-act="suggest" ${sample ? '' : 'disabled'}>Suggest what to eat next</button></div>
    <div class="ai-out" id="suggestOut">${suggestHTML}</div>
    <label class="field"><span class="label">Or describe a meal to estimate its calories</span>
      <textarea id="mealIn" placeholder="e.g. carinderia: 1 cup rice, chicken adobo 2 pcs, a bit of pinakbet"></textarea></label>
    <div class="row"><button class="btn" data-act="estimate" ${sample ? '' : 'disabled'}>Estimate & log</button></div>
    <div class="ai-out" id="estOut">${estHTML}</div>
    <div class="note">Uses your Anthropic API key: roughly US$0.01 to 0.05 per request depending on the model chosen in Setup. Estimates are approximate; portion size is the biggest error.</div>
  </div>`;
}

function renderProgress(){
  const date = today(), t = targets(date);
  const ws = Object.keys(days).filter(d => days[d].weight && d >= addDays(profile.startDate,-7)).sort();
  const cur = latestWeight(date), lost = profile.startKg - cur, togo = cur - profile.goalKg;
  const avg = avgWeight(date);
  const dayN = Math.max(1, diffDays(profile.startDate, date));
  const rate = ws.length > 1 ? (days[ws[0]].weight - (avg||cur)) / Math.max(1, diffDays(ws[0], date)) * 10 : null;
  const eta = addDays(profile.startDate, Math.ceil((profile.startKg - profile.goalKg)/0.1));
  const hist = [...Array(14)].map((_,i) => addDays(date,-i)).filter(d => d >= profile.startDate);
  $('#tab-progress').innerHTML = `
  <div class="card">
    <div class="stats">
      <div class="stat"><div class="label">Current</div><div class="v num">${cur.toFixed(1)}</div><div class="small muted">kg</div></div>
      <div class="stat"><div class="label">Lost</div><div class="v num">${lost.toFixed(1)}</div><div class="small muted">kg since start</div></div>
      <div class="stat"><div class="label">To go</div><div class="v num">${Math.max(0,togo).toFixed(1)}</div><div class="small muted">kg to ${profile.goalKg}</div></div>
      <div class="stat"><div class="label">Pace</div><div class="v num">${rate == null ? '—' : rate.toFixed(1)}</div><div class="small muted">kg / 10 days (goal 1.0)</div></div>
    </div>
    <div class="chartbox">${chart()}</div>
    <div class="small muted">Dashed line: the plan, 1 kg every 10 days, reaching ${profile.goalKg} kg around ${eta}. Dots: daily weigh-ins. Solid line: 7-day average.</div>
  </div>
  <div class="card">
    <h3>Why these numbers</h3>
    <div class="small">Maintenance at ${t.w.toFixed(1)} kg, ${profile.heightCm} cm, age ${profile.age}: about <b class="num">${t.maint}</b> kcal/day. You eat <b class="num">${t.kcal}</b> (500 under${profile.adjust ? `, ${profile.adjust} adjustment` : ''}) and the ${ruckBase(date).min}-min ruck burns about <b class="num">${Math.round(ruckBase(date).min*ruckRate(t.w))}</b> more. Total deficit ≈ <b class="num">${t.maint - t.kcal + Math.round(ruckBase(date).min*ruckRate(t.w))}</b> kcal/day. One kg of fat is about 7,700 kcal, so that is roughly 1 kg every <b class="num">${(7700/(t.maint - t.kcal + ruckBase(date).min*ruckRate(t.w))).toFixed(1)}</b> days. Protein ${t.protein} g/day keeps the weight you lose as fat, not muscle.</div>
  </div>
  <div class="card">
    <h3>Last 14 days</h3>
    <div class="tablebox"><table class="hist"><thead><tr><th>Day</th><th>Weight</th><th>kcal</th><th>Protein</th><th>Ruck</th><th>Lift</th><th>Verdict</th></tr></thead><tbody>
    ${hist.map(dd => { const v = verdict(dd), x = getDay(dd);
      const vt = dd === date ? (v.passed ? ['ok','pass'] : ['warn','open']) : v.passed ? ['ok','pass'] : ['bad','fail'];
      return `<tr><td class="num">${DOW[parseYmd(dd).getDay()]} ${dd.slice(5)}</td><td class="num">${x.weight ? x.weight.toFixed(1) : '—'}</td><td class="num">${x.foods.length ? v.tot.total + '/' + v.t.kcal : '—'}</td><td class="num">${v.tot.protein}</td><td class="num">${x.ruckMin||0}/${v.rp.min}</td><td>${v.ls ? v.ls + (v.items[3].s==='ok'?' ✓':'') : '—'}</td><td><span class="pill ${vt[0]}">${vt[1]}</span></td></tr>`; }).join('') || '<tr><td colspan="7" class="muted">Starts today.</td></tr>'}
    </tbody></table></div>
  </div>`;
}
function chart(){
  const W = 640, H = 240, L = 40, R = 12, T = 12, B = 28;
  const start = profile.startDate, endPlan = addDays(start, Math.ceil((profile.startKg-profile.goalKg)/0.1) + 5);
  const end = today() > endPlan ? today() : endPlan;
  const span = Math.max(1, diffDays(start, end));
  const pts = Object.keys(days).filter(d => days[d].weight && d >= start).sort().map(d => [d, days[d].weight]);
  const all = [profile.startKg, profile.goalKg, ...pts.map(p => p[1])];
  const lo = Math.floor(Math.min(...all) - 0.5), hi = Math.ceil(Math.max(...all) + 0.5);
  const x = d => L + (W-L-R) * diffDays(start, d) / span, y = w => T + (H-T-B) * (hi - w) / (hi - lo);
  let g = '';
  for (let w = lo; w <= hi; w++) g += `<line x1="${L}" x2="${W-R}" y1="${y(w)}" y2="${y(w)}" stroke="var(--line)" stroke-width="1"/><text x="${L-6}" y="${y(w)+4}" text-anchor="end" font-size="11" fill="var(--muted)" font-family="var(--mono)">${w}</text>`;
  const ticks = [0, Math.round(span/2), span];
  ticks.forEach(t => { const d = addDays(start, t); g += `<text x="${x(d)}" y="${H-8}" text-anchor="${t===0?'start':t===span?'end':'middle'}" font-size="11" fill="var(--muted)" font-family="var(--mono)">${d.slice(5)}</text>`; });
  const goalD = addDays(start, Math.ceil((profile.startKg-profile.goalKg)/0.1));
  g += `<polyline fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 4" points="${x(start)},${y(profile.startKg)} ${x(goalD)},${y(profile.goalKg)} ${x(end)},${y(profile.goalKg)}"/>`;
  const avgPts = pts.map(p => [p[0], avgWeight(p[0])]).filter(p => p[1]);
  if (avgPts.length > 1) g += `<polyline fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" points="${avgPts.map(p => `${x(p[0])},${y(p[1])}`).join(' ')}"/>`;
  pts.forEach((p,i) => g += `<circle cx="${x(p[0])}" cy="${y(p[1])}" r="${i===pts.length-1?4.5:3}" fill="${i===pts.length-1?'var(--accent)':'var(--surface)'}" stroke="var(--accent)" stroke-width="1.5"/>`);
  if (!pts.length) g += `<text x="${(L+W-R)/2}" y="${H/2}" text-anchor="middle" font-size="13" fill="var(--muted)">Log your morning weight on the Today tab to start the chart.</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:420px" role="img" aria-label="Weight versus plan">${g}</svg>`;
}

function renderSetup(){
  const t = targets(today());
  $('#tab-setup').innerHTML = `
  <form class="card" id="setupForm">
    <h2>Your numbers</h2>
    <div class="fields">
      <label class="field"><span class="label">Age</span><input id="sAge" type="number" min="14" max="90" value="${profile.age}"></label>
      <label class="field"><span class="label">Sex</span><select id="sSex"><option value="m" ${profile.sex==='m'?'selected':''}>Male</option><option value="f" ${profile.sex==='f'?'selected':''}>Female</option></select></label>
      <label class="field"><span class="label">Height cm</span><input id="sH" type="number" value="${profile.heightCm}"></label>
      <label class="field"><span class="label">Start weight kg</span><input id="sStart" type="number" step="0.1" value="${profile.startKg}"></label>
      <label class="field"><span class="label">Goal kg</span><input id="sGoal" type="number" step="0.1" value="${profile.goalKg}"></label>
      <label class="field"><span class="label">Start date</span><input id="sDate" type="date" value="${profile.startDate}"></label>
      <label class="field"><span class="label">Daily activity (outside training)</span><select id="sAct">${Object.entries(ACTIVITY).map(([k,l]) => `<option value="${k}" ${Number(k)===Number(profile.activity)?'selected':''}>${l}</option>`).join('')}</select></label>
      <label class="field"><span class="label">Vest weight kg</span><input id="sVest" type="number" step="0.5" value="${profile.vestKg}"></label>
      <label class="field"><span class="label">Your coffee</span><select id="sCoffee">${Object.entries(COFFEE).map(([k,c]) => `<option value="${k}" ${k===profile.coffeeType?'selected':''}>${c.label} (${c.kcal})</option>`).join('')}</select></label>
      <label class="field"><span class="label">Food list</span><select id="sRegion">${Object.keys(FOODS).map(k => `<option value="${k}" ${k===profile.region?'selected':''}>${REGION_LABEL[k]}</option>`).join('')}</select></label>
      <label class="field"><span class="label">Calorie adjustment</span><select id="sAdj">${[0,-150,-300,150].map(a => `<option value="${a}" ${a===Number(profile.adjust)?'selected':''}>${a>0?'+':''}${a} kcal</option>`).join('')}</select></label>
      <label class="field"><span class="label">Drink reminders</span><select id="sRemind"><option value="0" ${!profile.waterRemind?'selected':''}>Off</option>${[45,60,90,120].map(m => `<option value="${m}" ${profile.waterRemind && Number(profile.remindEvery)===m?'selected':''}>Every ${m} min</option>`).join('')}</select></label>
      <label class="field"><span class="label">Awake from / until (hour)</span><span class="row" style="flex-wrap:nowrap"><input id="sWake" type="number" min="0" max="23" value="${profile.wakeHour}"><input id="sSleep" type="number" min="1" max="24" value="${profile.sleepHour}"></span></label>
      <label class="field"><span class="label">Strict penalties</span><select id="sPen"><option value="1" ${profile.penalties?'selected':''}>On: missed ruck or overeating adds ruck time</option><option value="0" ${!profile.penalties?'selected':''}>Off</option></select></label>
    </div>
    <div class="row"><button class="btn primary" type="submit">Save</button><span class="small muted" id="setupMsg"></span></div>
    <div class="small muted">Current daily target: <b class="num">${t.kcal}</b> kcal, <b class="num">${t.protein}</b> g protein. Never below 1,500 kcal. When you reach your goal weight the target switches to maintenance automatically.</div>
  </form>
  <div class="card">
    <h3>Ground rules</h3>
    <ul class="small" style="margin:0;padding-left:18px;display:grid;gap:4px">
      <li>Log food as you eat it. Unlogged food still counts.</li>
      <li>Protein in every meal. Rice is half a cup unless you trained hard and have budget left.</li>
      <li>No sugary drinks. Water, black or sugar-free coffee, unsweetened tea.</li>
      <li>Three coffees a day stay. Their calories are reserved before food.</li>
      <li>Weigh every morning, judge only the 7-day average.</li>
      <li>Sleep 7 hours. Short sleep makes the hunger worse the next day.</li>
      <li>Dizzy, faint, or sharp joint pain: stop, eat, and rest. Strict does not mean injured.</li>
    </ul>
  </div>
  <div class="card">
    <h3>Account & sync</h3>
    ${uid ? `<div class="small">Signed in as <b>${esc(userEmail)}</b>. Everything you log syncs between your phone and laptop, and keeps working offline until you reconnect.</div>
      <div class="row"><button class="btn" data-act="syncnow">Sync now</button><button class="btn ghost" data-act="signout">Sign out</button></div>`
      : `<div class="small">You are using this device only. Sign in with the same account on your phone and laptop to sync.</div>
      <div class="row"><button class="btn primary" data-act="showauth" ${sb ? '' : 'disabled'}>Sign in to sync</button></div>`}
  </div>
  ${uid ? `<div class="card">
    <h3>Apple Health (iPhone)</h3>
    ${healthToken ? `<div class="small">Build the <b>Cutline Health</b> shortcut on your iPhone using these three values (tap to copy), then follow the steps below.</div>
      <div class="fields">
        <div class="field"><span class="label">1 · URL</span><button class="btn" data-copy="${esc(cfg().url + '/rest/v1/rpc/ingest_health')}">Copy URL</button></div>
        <div class="field"><span class="label">2 · apikey header</span><button class="btn" data-copy="${esc(cfg().key)}">Copy key</button></div>
        <div class="field"><span class="label">3 · Your link code</span><button class="btn" data-copy="${esc(healthToken)}">Copy code</button></div>
      </div>
      <details><summary class="small" style="cursor:pointer"><b>How to build the shortcut</b></summary>
      <ol class="small" style="display:grid;gap:6px;padding-left:20px">
        <li>Open <b>Shortcuts</b> → <b>+</b>. Name it <b>Cutline Health</b>.</li>
        <li>Add <b>Find Health Samples</b>: type <b>Steps</b>, Start Date <b>is today</b>. Then <b>Calculate Statistics</b> → <b>Sum</b>.</li>
        <li>Repeat for <b>Walking + Running Distance</b> (Sum) and <b>Active Energy</b> (Sum).</li>
        <li>Add <b>Find Health Samples</b>: type <b>Weight</b>, Start Date <b>is today</b>, Sort by <b>Start Date</b>, Order <b>Latest First</b>, Limit <b>1</b>.</li>
        <li>Add <b>Format Date</b>: Current Date, Date Format <b>Custom</b>, <code>yyyy-MM-dd</code>.</li>
        <li>Add <b>Get Contents of URL</b>: paste the URL. Method <b>POST</b>. Headers: <code>apikey</code> = the key, <code>Content-Type</code> = <code>application/json</code>. Request Body <b>JSON</b>, all fields type <b>Text</b>: <code>p_token</code> = your link code, <code>p_date</code> = Formatted Date, <code>p_steps</code> = the steps Sum, <code>p_distance_km</code> = the distance Sum, <code>p_active_kcal</code> = the energy Sum, <code>p_weight_kg</code> = the weight sample.</li>
        <li>Run it once and tap <b>Allow</b> for Health access. Today's steps should appear in this app within seconds.</li>
        <li>Make it automatic: <b>Automation</b> → <b>+</b> → <b>Time of Day</b> (e.g. 12:00, daily) → <b>Run Immediately</b> → action <b>Run Shortcut: Cutline Health</b>. Add more for 18:00 and 21:30.</li>
      </ol>
      <div class="small muted">Only the <code>apikey</code> header is needed. Don't add an Authorization header.</div></details>
      <div class="row"><button class="btn ghost" data-act="health-token">Make a new link code</button><span class="small muted">The old code stops working.</span></div>`
    : `<div class="small">Steps, distance, active calories and weight from your iPhone, sent here by an iPhone Shortcut a few times a day.</div>
      <div class="row"><button class="btn primary" data-act="health-token">Connect Apple Health</button></div>`}
  </div>` : ''}
  <form class="card" id="aiForm">
    <h3>Claude food help</h3>
    <div class="small muted">Your API key stays on this device and is never synced. Enter it once on each device. Create one at console.anthropic.com under API keys, and set a monthly spend limit there.</div>
    <div class="fields">
      <label class="field"><span class="label">Anthropic API key</span><input id="aiKey" type="password" autocomplete="off" placeholder="${getKey() ? 'Saved. Paste to replace' : 'sk-ant-…'}"></label>
      <label class="field"><span class="label">Model</span><select id="aiModel">${Object.entries(MODELS).map(([k,m]) => `<option value="${k}" ${k===getModel()?'selected':''}>${m.label}</option>`).join('')}</select></label>
    </div>
    <div class="row"><button class="btn primary" type="submit">Save</button>${getKey() ? '<button class="btn ghost" type="button" data-act="clearkey">Remove key</button>' : ''}<span class="small muted" id="aiMsg"></span></div>
  </div>`;
}

/* ---------- events ---------- */
function jumpTo(k){
  const go = tab => { activeTab = tab; showTab(); scrollTo(0, 0); };
  if (k === 'kcal' || k === 'protein') return go('food');
  if (k === 'lift') return go('train');
  const el = {ruck:'#cardRuck', water:'#cardWater', weigh:'#wIn', steps:'#cardActivity'}[k];
  const t = el && $(el);
  if (!t) return go('setup');
  t.scrollIntoView({behavior:'smooth', block:'center'});
  if (k === 'weigh') t.focus({preventScroll:true});
}
document.addEventListener('keydown', e => {
  const j = e.target.closest && e.target.closest('[data-jump]');
  if (j && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); jumpTo(j.dataset.jump); }
});
document.addEventListener('click', async e => {
  const j = e.target.closest('[data-jump]');
  if (j) { jumpTo(j.dataset.jump); return; }
  const b = e.target.closest('button, input.chk'); if (!b) return;
  const date = today();
  if (b.dataset.tab) { activeTab = b.dataset.tab; showTab(); return; }
  if (b.dataset.goto) { activeTab = b.dataset.goto; showTab(); scrollTo(0,0); return; }
  if (b.dataset.cup != null) { const d = ensureDay(date), i = +b.dataset.cup; d.coffee = d.coffee > i && d.coffee === i+1 ? i : Math.max(d.coffee, i+1); saveDay(date); return; }
  if (b.dataset.ex) { const d = ensureDay(date); d.workoutDone = d.workoutDone || []; const id = b.dataset.ex;
    d.workoutDone = b.checked ? [...new Set([...d.workoutDone, id])] : d.workoutDone.filter(x => x !== id); saveDay(date); return; }
  if (b.dataset.water) { const d = ensureDay(date), n = Number(b.dataset.water); d.water = Math.max(0, (d.water||0) + n); if (n > 0) d.waterAt = Date.now(); saveDay(date); return; }
  if (b.dataset.ruck) { const d = ensureDay(date); d.ruckMin = Math.max(0, (d.ruckMin||0) + Number(b.dataset.ruck)); saveDay(date); return; }
  if (b.dataset.delfood != null) { const d = ensureDay(date); d.foods.splice(+b.dataset.delfood, 1); saveDay(date); return; }
  if (b.dataset.addfood) { const [name,kcal,protein] = b.dataset.addfood.split('|'); logFood(name, +kcal, +protein); return; }
  if (b.dataset.rest != null) { startRest(+b.dataset.rest); return; }
  const act = b.dataset.act;
  if (act === 'remind-on') { await enableReminders(); }
  if (act === 'coffee-extra') { ensureDay(date).coffee++; saveDay(date); }
  if (act === 'coffee-undo') { const d = ensureDay(date); d.coffee = Math.max(0, d.coffee-1); saveDay(date); }
  if (act === 'ruck-start') { ensureDay(date).ruckStart = Date.now(); saveDay(date); }
  if (act === 'ruck-stop') { const d = ensureDay(date); d.ruckMin = (d.ruckMin||0) + Math.max(1, Math.round((Date.now()-d.ruckStart)/60000)); d.ruckStart = null; saveDay(date); }
  if (act === 'suggest') suggest(b);
  if (b.dataset.copy) {
    try { await navigator.clipboard.writeText(b.dataset.copy); const t = b.textContent; b.textContent = 'Copied'; setTimeout(() => { b.textContent = t; }, 1500); }
    catch { b.textContent = b.dataset.copy; }
    return;
  }
  if (act === 'health-token') {
    const tok = [...crypto.getRandomValues(new Uint8Array(18))].map(x => x.toString(16).padStart(2, '0')).join('');
    const r = await sb.from('health_tokens').upsert({user_id: uid, token: tok});
    if (r.error) { alertBox('Could not create a link code: ' + r.error.message + '. Run the latest supabase/schema.sql first.'); return; }
    healthToken = tok; saveHealthLocal(); render();
  }
  if (act === 'signout') { await sb.auth.signOut(); }
  if (act === 'syncnow') { await flush(); await pull(); }
  if (act === 'showauth') { try { localStorage.removeItem('cut69localOnly'); } catch {} showAuth(true); }
  if (act === 'clearkey') { try { localStorage.removeItem('cut69key'); } catch {} sample = null; render(); }
  if (act === 'estimate') estimate(b);
  if (act === 'estlog') { estItems.forEach(x => ensureDay(date).foods.push({...x, at:Date.now()})); estItems = []; estHTML = '<div class="small muted">Logged.</div>'; const m = $('#mealIn'); if (m) m.value = ''; saveDay(date); }
});
document.addEventListener('submit', e => {
  e.preventDefault();
  const date = today();
  if (e.target.id === 'wForm') { const w = parseFloat($('#wIn').value); if (w > 30 && w < 200) { ensureDay(date).weight = Math.round(w*10)/10; saveDay(date); } }
  if (e.target.id === 'aiForm') {
    const k = $('#aiKey').value.trim();
    try { if (k) localStorage.setItem('cut69key', k); localStorage.setItem('cut69model', $('#aiModel').value); } catch {}
    sample = getKey() ? {json: aiJson} : null; render();
    const m = $('#aiMsg'); if (m) m.textContent = 'Saved';
  }
  if (e.target.id === 'customFood') { logFood($('#cfName').value.trim(), +$('#cfKcal').value, +$('#cfProt').value || 0); }
  if (e.target.id === 'setupForm') {
    const n = (id, d) => { const v = parseFloat($(id).value); return isFinite(v) ? v : d; };
    profile = {...profile, age:n('#sAge',profile.age), sex:$('#sSex').value, heightCm:n('#sH',profile.heightCm), startKg:n('#sStart',profile.startKg),
      goalKg:n('#sGoal',profile.goalKg), startDate:$('#sDate').value || profile.startDate, activity:Number($('#sAct').value), vestKg:n('#sVest',profile.vestKg),
      coffeeType:$('#sCoffee').value, region:$('#sRegion').value, adjust:Number($('#sAdj').value), penalties:$('#sPen').value === '1',
      waterRemind:$('#sRemind').value !== '0', remindEvery:$('#sRemind').value !== '0' ? Number($('#sRemind').value) : profile.remindEvery,
      wakeHour:n('#sWake',profile.wakeHour), sleepHour:n('#sSleep',profile.sleepHour)};
    if (profile.waterRemind) enableReminders();
    setupDirty = false; saveProfile(); $('#setupMsg') && ($('#setupMsg').textContent = 'Saved');
  }
});
document.addEventListener('input', e => {
  if (e.target.id === 'foodSearch') { foodQuery = e.target.value; render(); }
  if (e.target.closest('#setupForm')) setupDirty = true;
});
document.addEventListener('change', e => {
  if (e.target.closest('#setupForm')) setupDirty = true;
  if (e.target.id === 'regionSel') { profile.region = e.target.value; saveProfile(); }
  if (e.target.id === 'locIn') { profile.location = e.target.value.trim(); saveProfile(); }
});
function logFood(name, kcal, protein){
  if (!name || !(kcal >= 0)) return;
  ensureDay(today()).foods.push({name: name.slice(0,120), kcal: Math.round(kcal), protein: Math.round(protein||0), at: Date.now()});
  saveDay(today());
}
function showTab(){
  document.querySelectorAll('nav.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === activeTab));
  document.querySelectorAll('main section').forEach(s => s.hidden = s.id !== 'tab-' + activeTab);
  try { localStorage.setItem('cut69tab', activeTab); } catch {}
}

/* rest timer + ruck clock */
let restEnd = 0, audioCtx = null;
function startRest(s){
  restEnd = s ? Date.now() + s*1000 : 0;
  if (s) { try { audioCtx ||= new (window.AudioContext || window.webkitAudioContext)(); } catch {} }
  tick();
}
function beep(){ if (!audioCtx) return; try { const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination); g.gain.value = .15; o.start(); o.stop(audioCtx.currentTime + .35); } catch {} }
function tick(){
  const rc = $('#restClock');
  if (rc) { const left = Math.max(0, Math.ceil((restEnd - Date.now())/1000)); rc.textContent = `${Math.floor(left/60)}:${z(left%60)}`;
    if (restEnd && left === 0) { restEnd = 0; beep(); } }
  const d = getDay(today()), clk = $('#ruckClock');
  if (clk && d.ruckStart) { const s = Math.floor((Date.now()-d.ruckStart)/1000); clk.textContent = `${Math.floor(s/60)}:${z(s%60)}`; }
}
setInterval(tick, 1000);
let lastDate = today();
setInterval(() => { if (today() !== lastDate) { lastDate = today(); render(); } }, 60000);

/* ---------- Claude helpers ---------- */
const MODELS = {
  'claude-opus-5-5':  {label:'Claude Opus 5.5: best local food knowledge (about $0.03 to 0.05)', fallback:true},
  'claude-sonnet-5-5':{label:'Claude Sonnet 5.5: good and cheaper (about $0.01 to 0.02)', fallback:true},
  'claude-haiku-5-5': {label:'Claude Haiku 5.5: fastest, a fraction of a cent', fallback:false},
};
function getKey(){ try { return localStorage.getItem('cut69key') || ''; } catch { return ''; } }
function getModel(){ let m = ''; try { m = localStorage.getItem('cut69model') || ''; } catch {} return MODELS[m] ? m : 'claude-opus-5-5'; }
let Anthropic = null;
async function aiJson(prompt, {modelTier} = {}){
  const key = getKey(); if (!key) throw {code:'no_key'};
  if (!Anthropic) Anthropic = (await import('https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.128.0/+esm')).default;
  const client = new Anthropic({apiKey: key, dangerouslyAllowBrowser: true});
  const model = getModel();
  const params = {
    model, max_tokens: 16000,
    output_config: {effort: modelTier === 'quick' ? 'low' : 'medium'},
    messages: [{role:'user', content: prompt}],
  };
  // on a safety decline, the API retries on a fallback model instead of failing
  const res = MODELS[model].fallback
    ? await client.beta.messages.create({...params, betas:['server-side-fallback-2026-07-01'], fallbacks:'default'})
    : await client.messages.create(params);
  if (res.stop_reason === 'refusal') throw {code:'refused'};
  const text = res.content.filter(b => b.type === 'text').map(b => b.text).join('');
  return parseLooseJson(text);
}
function parseLooseJson(t){
  try { return JSON.parse(t); } catch {}
  const f = t.match(/```(?:json)?\s*([\s\S]*?)```/); if (f) { try { return JSON.parse(f[1]); } catch {} }
  const i = t.search(/[\[{]/), j = Math.max(t.lastIndexOf(']'), t.lastIndexOf('}'));
  if (i >= 0 && j > i) { try { return JSON.parse(t.slice(i, j+1)); } catch {} }
  throw {code:'invalid_json'};
}
function aiError(e){
  const c = e && e.code, st = e && e.status;
  if (c === 'no_key') return 'Add your Anthropic API key in Setup first.';
  if (st === 401) return 'Your API key was rejected. Check it in Setup.';
  if (st === 403) return 'This API key is not allowed to use that model.';
  if (st === 429) return 'Rate limit or spend limit reached. Try again in a minute, or check your limits at console.anthropic.com.';
  if (st >= 500) return 'Claude is busy right now. Try again shortly.';
  if (st === 400) return 'The request was rejected (' + ((e && e.message) || 'bad request') + '). Try another model in Setup.';
  if (c === 'refused') return 'Claude declined that request. Rephrase it.';
  if (c === 'invalid_json') return 'Claude answered in an unexpected format. Try again.';
  if (!navigator.onLine) return 'You are offline. Food help needs an internet connection.';
  return 'Could not reach Claude. Check your connection and try again.';
}
async function suggest(btn){
  if (!sample) return;
  const loc = ($('#locIn').value || '').trim(); profile.location = loc; saveLocal();
  const out = $('#suggestOut'), date = today(), v = verdict(date);
  const left = v.t.kcal - v.tot.total, pLeft = Math.max(0, v.t.protein - v.tot.protein);
  const h = new Date().getHours(), meal = h < 10 ? 'breakfast' : h < 15 ? 'lunch' : h < 18 ? 'afternoon snack' : 'dinner';
  btn.disabled = true; out.innerHTML = '<div class="muted small">Thinking… this can take up to a minute.</div>';
  try {
    const res = await sample.json(
      `You are a strict but practical cutting coach. The person is ${profile.sex==='f'?'a woman':'a man'}, ${v.t.w} kg, cutting toward ${profile.goalKg} kg. ` +
      `They are at: ${loc || REGION_LABEL[profile.region]}. It is ${meal} time. Calories left today: ${left} kcal (coffee already counted). Protein still needed: ${pLeft} g. ` +
      `Already eaten today: ${v.tot.food ? getDay(date).foods.map(f=>f.name).join('; ') : 'nothing'}.\n` +
      `Suggest 5 specific, realistic orders they can buy near that location (local eateries, convenience stores like 7-Eleven/FamilyMart, fast-food chains common there, hotel options). ` +
      `Prioritise high protein, keep each under the remaining budget where possible, and say exactly what to order and what to skip (e.g. "half rice", "no sauce").\n` +
      `Reply with only a JSON array of objects: {"name": string (what to order, short), "where": string (type of place or chain), "kcal": number, "protein": number, "tip": string (one short sentence)}.`,
      {modelTier:'default'});
    const arr = Array.isArray(res) ? res.filter(x => x && x.name && isFinite(x.kcal)).slice(0,6) : [];
    suggestHTML = arr.length ? `<div class="foods">${arr.map(x => `<button class="food" data-addfood="${esc(String(x.name).replace(/\|/g,'/'))}|${Math.round(+x.kcal)}|${Math.round(+x.protein||0)}"><span class="fn">${esc(x.name)}</span><span class="fk">${Math.round(+x.kcal)}</span><span class="fp">${Math.round(+x.protein||0)} g protein · ${esc(x.where||'')}<br>${esc(x.tip||'')}</span></button>`).join('')}</div><div class="note">Tap one after you eat it to log it.</div>`
      : '<div class="muted small">No usable suggestions. Try adding more detail about where you are.</div>';
  } catch (e) { suggestHTML = `<div class="small" style="color:var(--bad)">${esc(aiError(e))}</div>`; }
  finally { const o = $('#suggestOut'); if (o) o.innerHTML = suggestHTML; const bb = document.querySelector('[data-act="suggest"]'); if (bb) bb.disabled = false; }
}
async function estimate(btn){
  if (!sample) return;
  const txt = ($('#mealIn').value || '').trim(); if (!txt) return;
  const out = $('#estOut'); btn.disabled = true; out.innerHTML = '<div class="muted small">Estimating…</div>';
  try {
    const res = await sample.json(
      `Estimate the calories and protein of this meal as eaten in ${profile.location || REGION_LABEL[profile.region]}. Use typical local portion sizes; if a portion is unclear, assume a normal single serving and round calories up slightly rather than down.\nMeal: ${txt.slice(0,800)}\n` +
      `Reply with only a JSON array, one object per distinct item: {"name": string, "kcal": number, "protein": number}.`, {modelTier:'quick'});
    const arr = Array.isArray(res) ? res.filter(x => x && x.name && isFinite(x.kcal)).slice(0,12) : [];
    if (!arr.length) { estHTML = '<div class="muted small">Could not split that meal. Try listing each item.</div>'; return; }
    estItems = arr.map(x => ({name:String(x.name).slice(0,120), kcal:Math.round(+x.kcal), protein:Math.round(+x.protein||0)}));
    const tot = arr.reduce((a,x) => a + Math.round(+x.kcal), 0), pr = arr.reduce((a,x) => a + Math.round(+x.protein||0), 0);
    estHTML = `<ul class="log">${arr.map(x => `<li><span class="nm">${esc(x.name)}</span><span class="num small">${Math.round(+x.kcal)} kcal · ${Math.round(+x.protein||0)} g</span><span></span></li>`).join('')}</ul>
      <div class="row"><b class="num">${tot} kcal · ${pr} g protein</b><button class="btn primary" data-act="estlog">Log all</button></div>`;
  } catch (e) { estHTML = `<div class="small" style="color:var(--bad)">${esc(aiError(e))}</div>`; }
  finally { const o = $('#estOut'); if (o) o.innerHTML = estHTML; const bb = document.querySelector('[data-act="estimate"]'); if (bb) bb.disabled = false; }
}

/* ---------- auth + boot ---------- */
function cfg(){
  const c = window.CUT69_CONFIG || {};
  let url = c.supabaseUrl, key = c.supabaseAnonKey;
  try { url = url || localStorage.getItem('cut69sbUrl'); key = key || localStorage.getItem('cut69sbKey'); } catch {}
  return {url, key};
}
function showAuth(on){
  const {url, key} = cfg();
  $('#auth').hidden = !on;
  $('#connectForm').hidden = !!(url && key);
  $('#loginForm').hidden = !(url && key && sb);
}
async function pull(){
  if (!sb || !uid) return;
  const [p, d] = await Promise.all([
    sb.from('profiles').select('data').eq('user_id', uid).maybeSingle(),
    sb.from('days').select('date,data').eq('user_id', uid).order('date', {ascending:false}).limit(400),
  ]);
  if (p.error || d.error) { syncError = (p.error || d.error).message; setSync(); return; }
  pullHealth();
  if (!p.data && !d.data.length) {
    // brand-new account: upload whatever this device already has
    markDirty('profile'); Object.keys(days).forEach(k => markDirty('d:'+k)); return;
  }
  if (p.data && !dirty.has('profile')) profile = {...DEFAULT_PROFILE, ...p.data.data};
  const remote = {};
  d.data.forEach(r => { remote[r.date] = r.data; });
  Object.keys(days).forEach(k => { if (dirty.has('d:'+k)) remote[k] = days[k]; });
  days = remote; syncError = null; saveLocal(); render();
}
async function pullHealth(){
  const [h, t] = await Promise.all([
    sb.from('health').select('*').eq('user_id', uid).order('date', {ascending:false}).limit(60),
    sb.from('health_tokens').select('token').eq('user_id', uid).maybeSingle(),
  ]);
  if (!h.error) { health = {}; h.data.forEach(r => { health[r.date] = r; }); }
  if (!t.error) healthToken = t.data ? t.data.token : null;
  saveHealthLocal(); applyHealthWeights(); render();
}
let channel = null;
function listen(){
  if (channel) sb.removeChannel(channel);
  channel = sb.channel('cut69-' + uid)
    .on('postgres_changes', {event:'*', schema:'public', table:'days', filter:'user_id=eq.' + uid}, payload => {
      const r = payload.new;
      if (!r || !r.date || dirty.has('d:' + r.date)) return;
      days[r.date] = r.data; saveLocal(); render();
    })
    .on('postgres_changes', {event:'*', schema:'public', table:'profiles', filter:'user_id=eq.' + uid}, payload => {
      const r = payload.new;
      if (!r || !r.data || dirty.has('profile')) return;
      profile = {...DEFAULT_PROFILE, ...r.data}; saveLocal(); render();
    })
    .on('postgres_changes', {event:'*', schema:'public', table:'health', filter:'user_id=eq.' + uid}, payload => {
      const r = payload.new;
      if (!r || !r.date) return;
      health[r.date] = r; saveHealthLocal(); applyHealthWeights(); render();
    })
    .subscribe();
}
async function onSession(session){
  const id = session ? session.user.id : null;
  if (id === uid && id) return;
  uid = id; userEmail = session ? session.user.email : '';
  if (uid) {
    try {
      const prev = localStorage.getItem('cut69uid');
      if (prev && prev !== uid) { days = {}; profile = clone(DEFAULT_PROFILE); dirty.clear(); persistDirty(); health = {}; healthToken = null; saveHealthLocal(); }
      localStorage.setItem('cut69uid', uid);
    } catch {}
    showAuth(false); listen(); await flush(); await pull();
  } else {
    if (channel) { sb.removeChannel(channel); channel = null; }
    let localOnly = false; try { localOnly = localStorage.getItem('cut69localOnly') === '1'; } catch {}
    showAuth(!localOnly);
  }
  render();
}
function alertBox(t){ const c = document.createElement('div'); c.className = 'coach bad'; c.textContent = t; const sec = $('#tab-' + activeTab); sec.prepend(c); setTimeout(() => c.remove(), 8000); }
function authMsg(t, bad){ const m = $('#authMsg'); m.textContent = t; m.style.color = bad ? 'var(--bad)' : 'var(--muted)'; }
document.addEventListener('submit', async e => {
  if (e.target.id === 'connectForm') {
    e.preventDefault();
    try { localStorage.setItem('cut69sbUrl', $('#cUrl').value.trim()); localStorage.setItem('cut69sbKey', $('#cKey').value.trim()); } catch {}
    location.reload();
  }
  if (e.target.id === 'loginForm') {
    e.preventDefault();
    const email = $('#lEmail').value.trim(), password = $('#lPass').value;
    const signup = e.submitter && e.submitter.value === 'signup';
    authMsg(signup ? 'Creating account…' : 'Signing in…');
    const r = signup
      ? await sb.auth.signUp({email, password, options:{emailRedirectTo: location.origin + location.pathname}})
      : await sb.auth.signInWithPassword({email, password});
    if (r.error) authMsg(r.error.message, true);
    else if (signup && !r.data.session) authMsg('Account created. Open the confirmation email, then come back here and sign in.');
    else authMsg('');
  }
});
document.addEventListener('click', e => {
  if (e.target.id === 'localOnly') { try { localStorage.setItem('cut69localOnly', '1'); } catch {} showAuth(false); }
});

sample = getKey() ? {json: aiJson} : null;
render(); showTab();
(() => {
  const {url, key} = cfg();
  if (!url || !key) { showAuth(true); setSync(); return; }
  if (!window.supabase) { setSync(); return; }
  sb = window.supabase.createClient(url, key, {auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}});
  sb.auth.onAuthStateChange((_ev, session) => { setTimeout(() => onSession(session), 0); });
})();
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
