import { useState, useEffect, useRef } from "react";

const LOGO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA4KCw0LCQ4NDA0QDw4RFiQXFhQUFiwgIRokNC43NjMuMjI6QVNGOj1OPjIySGJJTlZYXV5dOEVmbWVabFNbXVn/2wBDAQ8QEBYTFioXFypZOzI7WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVn/wAARCABRAKADASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAAAAUDBAYCAQf/xABEEAACAQMBBQQGBgYIBwAAAAABAgMABBEFBhIhMWETQVFxFCIygZGhFSNSscHRBxZCVJKyNENicoKT4fAkJTNTY3OU/8QAGQEBAAMBAQAAAAAAAAAAAAAAAAECAwQF/8QAKxEAAwACAQIDBwUBAAAAAAAAAAECAxESITEEE1EiMkFSYXGBQqGx4fCR/9oADAMBAAIRAxEAPwD57RTzRNmrzWEMsRjjgU+tJI4UDHTmfh76bx6Xs7ZSGJ7qbVblBlo7UhI182J8etVrLKJUtmNwcZwcV57x8a17a5Bau0djs1ZwMp3c3OZGB60frNrS43ILGMHkFtuH31R5n6fuVbld2ZD3j417Wsk2q1YAdvbafMD+yYOJ+dM7XT7O5U6lqcNsGA4WtqAvZdW72Py86pXiHC3S6Eri1tMQaHszLfxel3rta2QGQ5HrSf3Qfvqjqarp160FnKTGACGIG/x7ia0GpatdXt0lnbyB3cfVFiBw6+PSs/qejajpr9pfW8m4xyZBxBPU93vqmHJVXu3r0QSbXJLoU7k73ZuQA7plsDGTk8agrp3LuWPM/Kua7SAooooAooooAooooAooooAooooDSW0PabMzYOO13E544GUV5FpQg7T0eWKaPeMUgwCN5SDghsZ44413FHnYqRu4tGD/AB1xaQLJC0kt0e0VAVEi74wWx38q83b03v4s0z0p166Q3tXkjinkupLiVzxDdovDx4ZNRzXG/Iyyyu0aIhUOc4B44+dQOi20vZ4jkypz9Wgx6pPd38jUmm2I1KeYzSLHbRRxmRyfawo9UD7z3VgpW3TOZcrakND0gahMNQvHMWnwAAYODKwA4A9w60t1W/SO9kWzlMiq2EDHJ/unxqxq2sPqMotrKNbeJV3DuHAAHh061Si09ISvLfIDBWYKW68eQ+Zrpxtrrfb0NsjjHPBdWLzbl915cl2GS3gckVrrCS5uthdSFzdSubcyIAWzlQqkA+OONJbrs44QMKjdnuH6wNvHeySMchTXTGP6k6u49l5Zv5VqMlblP6r+SMDbpmLra6Vstpd/pdtddvclpEBbdYABu8cvGsbNH2UpXyPx41vdmbhY9BtlLAH1v5jW/irqYTllaekQSbMaBE5SXUHRxzVpkBHuxXcOymh3BIgvpZSOJCTIcfAUk13TLy81i4ngiDxuQQ2+ozwHWrGzFhdWGpme4RY07Nlzvg5J8jWLbUcvM6jktdyttFs59EtC9vK00Mzbg3hhlbw607t9ibJYV9JuZ2lx624QFB6ZFebV3CyW1ioYE+kqce6mt7chra5XPONx8jWdZ8nCevcjkKDs1s8Oept/9Ef5Ufq1s7kf80P+fH+VYevK6/Jv52XNPs9oWn6pLexyzzBoHwgjI4rkjPKm8+yOiW4U3F7NFvct+RFz8RSnYqZYJrxmOMoo+dOdbt7bV0hWa4aIREkELnOcePlXPlyVOXjy0ijpJ6II9mdn5XCR6k7uxwFWZCT8qra3sfDaWMtzZXEjGJd5kkxxHfgiubTQ9Pt7uGYXsjmNw4XdAyQc001/Un+ibhYIjKZEKsQfYB5nHOq+bXNKK39xzW9IoaPD6XsRfxoMvGpYAeIw34GlMfAzJ6xUxAoVXPAkMKbfo8v0jvJbKXG7OOAPeRx+YLfCuNR0trJ7mCJA0tid5Qwz2luxyrDx3TkGrNcKqfrs1y+0kxhpum+mXJUke0O/jxQCpdc0S5jt4rRGVbaLiFTvJ5k9TS2w1d0KMkicB6u9CSV6ZA4imd9qvapHns7jeXJHZEbp8ONcVeZNiblS9GeayW1jZyjLgFc4PMgjFXDuqszEhQpJ5quTlRzYGpLlBBCJh2S9oFOI8cOL0ne8YJgkcSDz65rpndnPrj3PL+4ZUJQr1yY24e5RTwo1j+j5ITwluxvY/wDYwx8hSTSbFtc1KG2VpBAq7907NkKo5npnkK0OqXC6hqyRRgLa2eJWHcMDEa/DjV8ns6n8/wDDowrjLtmM1QBdRmUfskD4ACn2lyFdMtwM+yf5jWcvH7W6ll7mc4rlLiZFCpNIqjuDECuq8TyY1JjUup0N9S1S6t71442UIAuAVB5gVVGt33/cX+AUw0fZu41NDe30xtrMDeMrn1mHiM93U1Pca3pmlEw6HYxO68DdTrvE+QP+nlVEsa9iZ20aLEkuonLX13PFPMk8qoQQQhwBnuwK0zT74beJKOCMjwI/1pTY3u0Gu3yww31znmxVyioPE44VPtffxtqUUNlcO8kMYSaVGx2j+7metUy43dKO2it4+S2n2Kf0DH+/L74mo+gU/fl/ympdJc30RAkmuEJ4jeYigXF80RlEtwY1OC+82AfDNa8cvzEav1GOiKYZbxAd7dIXIHPiat6jbG+ijQvubjE8VJzms8GuIAHDSxiTiGBI3vzq2sGrtbG4Ed6YAMmTDbuPHNVvC+fNVoq8bdckyxFpBjmRzPkKQeCHNN3uezVpJPVQAk55eVZX0u5/eJf4zXDyySf9SR3x9ok0rBVtO6IeN0+rJLO5e0uo542KshByO7rX0ky/TlpBd2ZVNQgz2YJ4P9qJj4HmD5Gvl9NNG1aTTphxJjPArnGR+BHcfdTxGJ17U91+5146Xu12Lt/beu81khQ7xEls2QyN3gDx6fCqEeokKwcurAYGHYEH41s7iOz1+FZ1nWC8I3VuMerLj9mQeI8eYrMalZTWM3Z6rbbueCyMN5W8nH41jjuaWn/ZleFy+xUkv95CWkySRw97fnU+laVe63IsVpF9Wpw078EQeff5CpbQ6PbnfkhjkI7uLfecU5TVr/VIRBYRLb2g9UyHgg6f2vIVLyNe7P5ZovDylumXStvpVquj6MpuLmc+u/fMw7ye5RSvW3XSrL6Phk7W7lYmaTvZjzPQfhVx9Ts9nraSO1Yz30oxJO3Fj0Hh5Dl1NY68uXkld5DmZ/a/sDw8/Gq4cbyVyfb+f6K5LV6meyKrkE4HIcBWh2O0ZNTvmmuF3re3wSp5Ox5A9O+s5Wl2R16DSXmhuwwgmIbfUZ3SPEeFdmfl5b4dxGuXU82s119Qu3tLdt2zhbdwOHaEd56eArOd9OLvSbc3DvaapZSQsSVLyFWA6giuItOs14zXj3BH9XaRMxP+JgAPnTG4iUpFbb6nlvqGo3KJp1l9Ukhx2Vuu7vnqRxPvNaT0eLZ/s7HTIEutZkUM87gFYQe/jwA/2fCk8Uupwso0jTLi1QEElYmd3x9pscR0GB0qe7j2o1CTtWsblPWDkR2+4Cw5E8OOOtZXPJ/BL/dyyei/rmnyyw2+nSTz3+qyHtZJHlPZwg8OXIDu/wBgV7rV1abP6PDpEIWefhJIGHq73PeYd/HkOgz1pXEW1lzcJO9tcq6MHG7EFGRyJHf76W3Wia3cTyT3FnM0kjFmZsDJqkyuiulpfX4kt99I1Gn3kOulr+4geS30yICK3PrszkcWI7+QwKXXl7fSLPLIfRDOpRri8bdYIeaRxjiB5AnrSNNL1W2YlIZoj3lWwfkaqy2d3vFpY3LHmTxNXnFO+j6EOnokkbT4QViWW5f7bncX3KOPzqkx3mJAC57hXTRuvtKR7q4rqS0ZhRzooqQWLLULiwk3oiGU+0jcQw61rNO2kjuIOwJVlbgba44j/C1YwAnlXvYoeLyBfLia5suCL6/E1jM46fA2FzaaNAEuHtIoXYZCSMT8FHP7qW3mus57O2J5bobwHgAOXkKTB7dDkxvM2MZkbA+AqQahOgxDuQj/AMagfOsp8O/1dfv/AJmWSudbS0WY9Pv5zviJkz/WTEJgdM8q7Gk2sQ/4vVLeM/ZiUyH8BSySaWU5kkZz1OajrpU366+xXTHS/q/B7Xp10fNYx+Jrr6X02H+jaJb+c7tIfvxSOinlJ923+SR8u1NzF/R7Sxg8Ny3Xh8q8fa7WmGBdmMeCKBSKio8jH8pbbQ1faLWJPa1G49z4qs+qX8hy97ct5yt+dU6KuscLskOT9SVrid/bmkbzYmoySeZzXlFWSSI2FFFFSAooooAooooDr9g1zRRRAKKKKAKKKKAKKKKAKKKKAKKKKAKKKKAKKKKAKKKKA//Z";

// Storage helpers
const DB = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

const DEFAULT_SETTINGS = {
  appName: "PCB Care", tagline: "Professional Appliance Repair Community",
  primaryColor: "#4caf50", accentColor: "#ffd700",
  adminPassword: "pcbcare2024", aiToken: "", aiUrl: "", aiName: "PCB AI",
  adsenseId: "", adsEnabled: false,
  partsEnabled: true,
  notificationsEnabled: true,
  filterKeywords: ["fuck","shit","bitch","asshole","bastard","whore","idiot","stupid"]
};

function useSettings() { return DB.get("pcb_settings", DEFAULT_SETTINGS); }

function saveSettings(s) { DB.set("pcb_settings", s); }

function useOnline() {
  const [n, setN] = useState(Math.floor(Math.random()*12)+3);
  useEffect(() => { const t = setInterval(() => setN(Math.floor(Math.random()*12)+3), 18000); return () => clearInterval(t); }, []);
  return n;
}

function moderate(text, settings) {
  const s = settings || DEFAULT_SETTINGS;
  if (/(\+?[\d\s\-()]{10,})/.test(text)) return { blocked: true, reason: "Phone numbers are not allowed in posts." };
  if (/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|net|org|pk|io|app)[^\s]*)/i.test(text)) return { blocked: true, reason: "URLs and links are not allowed in posts." };
  const lower = text.toLowerCase();
  for (const kw of (s.filterKeywords || [])) { if (lower.includes(kw.toLowerCase())) return { blocked: true, reason: "Your message contains prohibited language." }; }
  return { blocked: false };
}

// ── ADSENSE SLOT ──────────────────────────────────────────────────────────────
function AdSlot({ slotId }) {
  const s = useSettings();
  if (!s.adsenseId || !s.adsEnabled) return null;
  return (
    <div style={{background:"#1a1f2e",border:"1px solid #2a3050",borderRadius:8,padding:10,textAlign:"center",margin:"10px 0"}}>
      <ins className="adsbygoogle" style={{display:"block"}} data-ad-client={s.adsenseId} data-ad-slot={slotId} data-ad-format="auto" data-full-width-responsive="true"/>
      <div style={{fontSize:9,color:"#3a4060",marginTop:2}}>Advertisement</div>
    </div>
  );
}

// ── DEFAULT DATA ──────────────────────────────────────────────────────────────
const DEFAULT_ERRORS = {
  fridge: {
    Samsung: [{code:"1E",meaning:"Ice Maker Sensor Error",cause:"Faulty ice maker sensor or wiring",fix:"Check sensor connector. Replace if reading out of range."},{code:"2E",meaning:"Fridge Sensor Error",cause:"Defective compartment sensor",fix:"Test resistance 5kΩ–10kΩ. Replace if faulty."},{code:"4E",meaning:"Defrost Sensor Error",cause:"Sensor shorted or open circuit",fix:"Inspect wiring harness. Replace defrost sensor assembly."},{code:"5E",meaning:"Freezer Defrost Error",cause:"Faulty freezer defrost sensor",fix:"Check continuity. Replace sensor if faulty."},{code:"88",meaning:"Display Test Mode",cause:"Activated during power reset",fix:"Hold top buttons 8 seconds to exit test mode."}],
    LG: [{code:"Er FF",meaning:"Freezer Fan Error",cause:"Fan motor failure or ice buildup blocking fan",fix:"Defrost manually. Check motor wiring. Replace fan motor."},{code:"Er CF",meaning:"Condenser Fan Error",cause:"Condenser fan not running",fix:"Check for debris. Replace condenser fan motor."},{code:"Er dH",meaning:"Defrost Heater Error",cause:"Open circuit or thermal fuse blown",fix:"Test continuity. Replace heater or thermal fuse."},{code:"Er FS",meaning:"Freezer Sensor Error",cause:"Freezer temp sensor fault",fix:"Check sensor wiring. Replace temperature sensor."}],
    Haier: [{code:"F1",meaning:"Fridge Sensor Fault",cause:"Refrigerator NTC sensor open or short",fix:"Test NTC resistance. Replace if out of spec."},{code:"F2",meaning:"Freezer Sensor Fault",cause:"Freezer NTC sensor failure",fix:"Check wiring. Replace sensor."},{code:"E1",meaning:"Compressor Overload",cause:"Compressor overheating or overloaded",fix:"Clean condenser coils. Allow to cool then restart."}],
    Dawlance: [{code:"E0",meaning:"EEPROM Error",cause:"Control board memory fault",fix:"Reset board. Replace control board if persists."},{code:"E1",meaning:"Fridge Sensor Error",cause:"Fridge compartment sensor fault",fix:"Replace fridge temperature sensor."},{code:"E2",meaning:"Freezer Sensor Error",cause:"Freezer temperature sensor fault",fix:"Replace freezer temperature sensor."}]
  },
  washing: {
    Samsung: [{code:"4E",meaning:"Water Supply Error",cause:"No water or low water pressure",fix:"Check tap is open. Inspect inlet hose. Clean filter mesh."},{code:"5E",meaning:"Drain Error",cause:"Water not draining from drum",fix:"Check drain hose. Clean pump filter. Inspect drain pump."},{code:"3E",meaning:"Motor Error",cause:"Motor not running or overcurrent",fix:"Check motor wiring. Inspect brushes. Replace motor if faulty."},{code:"UE",meaning:"Unbalanced Load",cause:"Laundry unevenly distributed",fix:"Redistribute clothes evenly in drum."},{code:"DE",meaning:"Door Lock Error",cause:"Door not closed or latch failure",fix:"Check door catch. Replace door lock assembly."}],
    LG: [{code:"IE",meaning:"Inlet Error",cause:"Water not entering machine",fix:"Check supply valve. Clean inlet filter. Inspect valve solenoid."},{code:"OE",meaning:"Outlet Error",cause:"Drain not completing",fix:"Clean pump filter. Check drain hose height. Test drain pump."},{code:"UE",meaning:"Unbalanced Error",cause:"Load imbalance during spin",fix:"Redistribute load. Check drum bearings if persistent."},{code:"LE",meaning:"Motor Locked Error",cause:"Motor overloaded or stalled",fix:"Reduce load. Check drum obstruction. Replace motor if needed."}],
    Haier: [{code:"E1",meaning:"Water Inlet Timeout",cause:"Water not reaching level in time",fix:"Check water pressure. Clean inlet filter. Inspect inlet valve."},{code:"E2",meaning:"Drain Timeout",cause:"Water not draining within set time",fix:"Clean pump filter. Check drain hose. Replace drain pump."},{code:"E3",meaning:"Motor Speed Error",cause:"Motor not reaching target RPM",fix:"Check motor brushes. Replace motor if needed."}]
  },
  ac: {
    Gree: [{code:"E1",meaning:"High Pressure Protection",cause:"Dirty condenser or overcharged refrigerant",fix:"Clean condenser coil. Check refrigerant charge."},{code:"E2",meaning:"Anti-Freeze Protection",cause:"Indoor coil freezing — low refrigerant or dirty filter",fix:"Clean air filter. Check refrigerant level."},{code:"E3",meaning:"Low Pressure Protection",cause:"Low refrigerant charge or leak",fix:"Check for leak. Recharge after fixing."},{code:"E6",meaning:"Communication Error",cause:"Indoor-outdoor unit comm failure",fix:"Check communication wiring. Inspect control boards."},{code:"F1",meaning:"Indoor Sensor Open",cause:"Room temperature sensor disconnected",fix:"Check connector. Replace room temp sensor."}],
    LG: [{code:"CH01",meaning:"Indoor Sensor Fault",cause:"Indoor air temperature sensor error",fix:"Replace indoor room temperature sensor."},{code:"CH05",meaning:"Communication Error",cause:"Signal failure between units",fix:"Check communication cable. Inspect PCB boards."},{code:"CH21",meaning:"High Pressure Fault",cause:"Refrigerant overpressure",fix:"Clean condenser. Check refrigerant charge."},{code:"CH22",meaning:"Low Pressure Fault",cause:"Refrigerant undercharge or leak",fix:"Check for leaks. Recharge refrigerant."}],
    Haier: [{code:"E1",meaning:"High Pressure Protection",cause:"Condenser blocked or overcharge",fix:"Clean condenser coil. Check refrigerant."},{code:"E2",meaning:"Low Pressure Protection",cause:"Low refrigerant or restriction",fix:"Check for leaks. Recharge refrigerant."},{code:"E6",meaning:"Communication Failure",cause:"Indoor-outdoor communication error",fix:"Check communication wire. Replace PCB if wiring fine."}]
  }
};

const DEFAULT_BRANDS = {
  fridge: ["Samsung","LG","Haier","Dawlance","PEL","Whirlpool","Orient","Kenwood"],
  washing: ["Samsung","LG","Haier","Super Asia","Dawlance","Whirlpool","Kenwood","Orient"],
  ac: ["Gree","LG","Haier","Samsung","Orient","Dawlance","Kenwood","Aux"]
};

const DEFAULT_WIRING = [
  { category:"Fridge", items:[
    { title:"Compressor Circuit", description:"Start relay, overload protector, compressor connections", image:"", tips:["Shake relay — rattling means it is dead","Overload clips directly onto compressor body","Test C-S and C-R pins: should show resistance"] },
    { title:"Defrost System", description:"Heater, thermostat, and defrost timer circuit", image:"", tips:["Test thermostat when fully frozen","Heater shows continuity when cold","Timer advances defrost every 8-12 hours"] }
  ]},
  { category:"Washing", items:[
    { title:"Motor Circuit", description:"Universal motor with carbon brushes", image:"", tips:["Replace brushes if under 5mm length","Field coil resistance should be 3-5Ω","Tacho failure causes motor speed errors"] },
    { title:"Door Lock Circuit", description:"Door lock mechanism and interlock connections", image:"", tips:["Test solenoid coil: 600-1000Ω","Signal wire confirms locked state to PCB","Door lock takes 2-3 seconds to engage"] }
  ]},
  { category:"AC", items:[
    { title:"Capacitor Wiring", description:"Dual capacitor connections for compressor and fan", image:"", tips:["Bulged top means dead capacitor — replace now","Test capacitance: acceptable within 5% of rated","Wrong µF value causes compressor damage over time"] }
  ]}
];
const DEMO_POSTS = [
  { id:"p1", author:"Imran Tech", avatar:"IT", time:"2h ago", text:"Samsung fridge RF28 making clicking sound every 5 minutes. Compressor runs then clicks off. Checked start relay — seems fine. Any ideas?",
    replies:[
      { author:"Sara Electro", avatar:"SE", time:"1h ago", text:"Check the overload protector on the compressor. If relay is fine but still clicking, overload is likely the issue." },
      { author:"PCB AI 🤖", avatar:"AI", time:"45m ago", text:"Clicking then shutting off is a classic overload protector failure. Test by bypassing it temporarily. If compressor runs smoothly, replace overload. Also check condenser coils — dirty coils cause overheating which triggers the overload." }
    ]},
  { id:"p2", author:"Sara Electro", avatar:"SE", time:"5h ago", text:"LG washing machine giving OE error. Drain pump working fine, hose is clear. Still showing OE after every cycle.",
    replies:[{ author:"Imran Tech", avatar:"IT", time:"4h ago", text:"Check the pressure sensor hose — sometimes it gets clogged with lint and gives false OE error." }]}
];

const DEMO_USERS = {
  pending: [
    { id:"u1", name:"Ahmed Raza", email:"ahmed@example.com", phone:"+92-300-1234567", method:"Google", joined:"2026-06-10" },
    { id:"u2", name:"Bilal Khan", email:"bilal@example.com", phone:"+92-321-9876543", method:"Facebook", joined:"2026-06-11" },
    { id:"u3", name:"Zara Ali", email:"zara@example.com", phone:"+92-333-5554444", method:"Phone", joined:"2026-06-12" }
  ],
  approved: [
    { id:"u4", name:"Imran Tech", email:"imran@example.com", phone:"+92-312-1111111", method:"Google", joined:"2026-06-01", muted:false },
    { id:"u5", name:"Sara Electro", email:"sara@example.com", phone:"+92-315-2222222", method:"Facebook", joined:"2026-06-02", muted:false }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTRO ANIMATION
// ═══════════════════════════════════════════════════════════════════════════════
function Intro({ onDone }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => setPhase(3), 2200);
    const t4 = setTimeout(() => onDone(), 3400);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, [onDone]);
  return (
    <div style={{position:"fixed",inset:0,background:"#0a0d14",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:9999,overflow:"hidden"}}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.1}} viewBox="0 0 400 800">
        <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4caf50"/><stop offset="100%" stopColor="#ffd700"/></linearGradient></defs>
        {[...Array(8)].map((_,i) => <line key={i} x1={i*55} y1="0" x2={i*55} y2="800" stroke="url(#g1)" strokeWidth="1"/>)}
        {[...Array(15)].map((_,i) => <line key={i} x1="0" y1={i*56} x2="400" y2={i*56} stroke="url(#g1)" strokeWidth="1"/>)}
        {[...Array(6)].map((_,i) => <circle key={i} cx={55+i*55} cy={100+i*90} r="5" fill="#4caf50" opacity="0.6"/>)}
      </svg>
      <div style={{transition:"all 0.9s cubic-bezier(0.34,1.56,0.64,1)",transform:phase>=1?"scale(1) translateY(0)":"scale(0.2) translateY(60px)",opacity:phase>=1?1:0,marginBottom:24,filter:"drop-shadow(0 0 40px rgba(76,175,80,0.7))"}}>
        <img src={LOGO} alt="PCB Care" style={{width:240,height:"auto"}}/>
      </div>

      <div style={{position:"absolute",bottom:70,width:200,height:2,background:"#1a1f2e",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",background:"linear-gradient(90deg,#4caf50,#ffd700)",borderRadius:2,transition:"width 2.8s ease",width:phase>=1?"100%":"0%"}}/>
      </div>
      <div style={{position:"absolute",bottom:48,fontSize:10,color:"#3a4060",letterSpacing:3}}>LOADING...</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function Auth({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | form | pending
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({ fullName:"", country:"Pakistan", state:"", city:"", experience:"", specialization:"" });
  const [formErrors, setFormErrors] = useState({});
  const s = useSettings();
  const pc = s.primaryColor;
  const ac = s.accentColor;

  const EXPERIENCE = ["Less than 1 year","1 - 3 years","3 - 5 years","5 - 10 years","More than 10 years"];
  const SPECIALIZATIONS = ["Refrigerator / Fridge","Washing Machine","Air Conditioner","All Appliances","Other Electronics"];

  const validateForm = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = "Full name is required";
    if (!formData.city.trim()) errs.city = "City is required";
    if (!formData.experience) errs.experience = "Please select your experience";
    if (!formData.specialization) errs.specialization = "Please select your specialization";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = () => {
    if (!validateForm()) return;
    const users = DB.get("pcb_users", { pending: [], approved: [] });
    const newUser = {
      id: "u" + Date.now(),
      name: formData.fullName,
      email: "",
      phone: phone || "Via Google",
      method: phone ? "Phone" : "Google",
      joined: new Date().toISOString().split("T")[0],
      country: formData.country,
      state: formData.state,
      city: formData.city,
      experience: formData.experience,
      specialization: formData.specialization,
      muted: false
    };
    DB.set("pcb_users", { ...users, pending: [...users.pending, newUser] });
    setMode("pending");
  };

  // ── PENDING SCREEN ──
  if (mode === "pending") return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"#0a0d14",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#1a1f2e",borderRadius:20,padding:32,maxWidth:360,width:"100%",textAlign:"center",border:"1px solid #2a3050"}}>
        <img src={LOGO} alt="PCB Care" style={{width:150,marginBottom:20}}/>
        <div style={{fontSize:38,marginBottom:14}}>⏳</div>
        <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:8}}>Registration Submitted!</div>
        <div style={{fontSize:13,color:"#6b7db3",lineHeight:1.7,marginBottom:20}}>Your account is pending manual approval by the admin. You will be notified once approved. This usually takes 24–48 hours.</div>
        <div style={{background:"#0f1117",borderRadius:10,padding:12,border:"1px solid #ffd70022",marginBottom:20}}>
          <div style={{fontSize:11,color:"#ffd700"}}>📧 Check your phone for updates</div>
        </div>
        <button onClick={() => setMode("login")} style={{background:"none",border:"1px solid #2a3050",borderRadius:10,padding:"10px 20px",color:"#6b7db3",cursor:"pointer",fontSize:13}}>← Back to Login</button>
      </div>
    </div>
  );

  // ── REGISTRATION FORM ──
  if (mode === "form") return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"#0a0d14",minHeight:"100vh",padding:20,overflowY:"auto"}}>
      <div style={{maxWidth:420,margin:"0 auto"}}>
        <div style={{textAlign:"center",padding:"24px 0 20px"}}>
          <img src={LOGO} alt="PCB Care" style={{width:140,marginBottom:12}}/>
          <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>Complete Your Profile</div>
          <div style={{fontSize:12,color:"#6b7db3"}}>Fill in your details to get approved</div>
        </div>
        <div style={{background:"#1a1f2e",borderRadius:16,padding:20,border:"1px solid #2a3050",marginBottom:16}}>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:"#e8eaf0",marginBottom:6}}>👤 Full Name <span style={{color:"#ff4757"}}>*</span></div>
            <input value={formData.fullName} onChange={e => setFormData(f => ({...f,fullName:e.target.value}))} placeholder="Enter your full name"
              style={{width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${formErrors.fullName?"#ff4757":"#2a3050"}`,background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
            {formErrors.fullName && <div style={{color:"#ff4757",fontSize:11,marginTop:4}}>⚠ {formErrors.fullName}</div>}
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:"#e8eaf0",marginBottom:6}}>🗺️ State / Province</div>
            <input value={formData.state} onChange={e => setFormData(f => ({...f,state:e.target.value}))} placeholder="e.g. Punjab, Sindh..."
              style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:"#e8eaf0",marginBottom:6}}>🏙️ City <span style={{color:"#ff4757"}}>*</span></div>
            <input value={formData.city} onChange={e => setFormData(f => ({...f,city:e.target.value}))} placeholder="e.g. Karachi, Lahore..."
              style={{width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${formErrors.city?"#ff4757":"#2a3050"}`,background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
            {formErrors.city && <div style={{color:"#ff4757",fontSize:11,marginTop:4}}>⚠ {formErrors.city}</div>}
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:"#e8eaf0",marginBottom:6}}>🔧 Years of Experience <span style={{color:"#ff4757"}}>*</span></div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {EXPERIENCE.map(exp => (
                <button key={exp} onClick={() => setFormData(f => ({...f,experience:exp}))}
                  style={{padding:"8px 14px",borderRadius:20,border:formData.experience===exp?`2px solid ${pc}`:"1px solid #2a3050",background:formData.experience===exp?`${pc}22`:"#0f1117",color:formData.experience===exp?pc:"#6b7db3",fontSize:11,cursor:"pointer",fontWeight:formData.experience===exp?600:400}}>
                  {exp}
                </button>
              ))}
            </div>
            {formErrors.experience && <div style={{color:"#ff4757",fontSize:11,marginTop:6}}>⚠ {formErrors.experience}</div>}
          </div>
          <div style={{marginBottom:6}}>
            <div style={{fontSize:12,fontWeight:600,color:"#e8eaf0",marginBottom:6}}>⚙️ Specialization <span style={{color:"#ff4757"}}>*</span></div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {SPECIALIZATIONS.map(sp => (
                <button key={sp} onClick={() => setFormData(f => ({...f,specialization:sp}))}
                  style={{padding:"8px 14px",borderRadius:20,border:formData.specialization===sp?`2px solid ${ac}`:"1px solid #2a3050",background:formData.specialization===sp?`${ac}22`:"#0f1117",color:formData.specialization===sp?ac:"#6b7db3",fontSize:11,cursor:"pointer",fontWeight:formData.specialization===sp?600:400}}>
                  {sp}
                </button>
              ))}
            </div>
            {formErrors.specialization && <div style={{color:"#ff4757",fontSize:11,marginTop:6}}>⚠ {formErrors.specialization}</div>}
          </div>
        </div>
        <div style={{background:"#1a1f2e",borderRadius:12,padding:12,border:"1px solid #4caf5022",marginBottom:16}}>
          <div style={{fontSize:11,color:"#4caf50",fontWeight:600,marginBottom:4}}>🔐 Why we ask this</div>
          <div style={{fontSize:11,color:"#6b7db3",lineHeight:1.6}}>Your details help admin verify you are a real technician. Only visible to admin.</div>
        </div>
        <button onClick={handleFormSubmit} style={{width:"100%",padding:"14px",borderRadius:12,background:`linear-gradient(135deg,${pc},${ac})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:15,marginBottom:12}}>
          Submit Registration →
        </button>
        <button onClick={() => setMode("login")} style={{width:"100%",padding:"11px",borderRadius:12,background:"none",border:"1px solid #2a3050",color:"#6b7db3",cursor:"pointer",fontSize:13,marginBottom:24}}>
          ← Back
        </button>
      </div>
    </div>
  );

  // ── LOGIN SCREEN ──
  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"#0a0d14",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#1a1f2e",borderRadius:20,padding:32,maxWidth:380,width:"100%",border:"1px solid #2a3050"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <img src={LOGO} alt="PCB Care" style={{width:190,marginBottom:14}}/>
          <div style={{fontSize:13,color:"#6b7db3"}}>Sign in to join the technician community</div>
        </div>

        {/* Google Login Only */}
        <button onClick={() => setMode("form")}
          style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"14px 16px",borderRadius:12,border:"1px solid #dadce0",background:"#fff",color:"#3c4043",cursor:"pointer",fontWeight:600,fontSize:14,marginBottom:20,boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
          <div style={{flex:1,height:1,background:"#2a3050"}}/>
          <div style={{fontSize:12,color:"#6b7db3"}}>or sign up with phone</div>
          <div style={{flex:1,height:1,background:"#2a3050"}}/>
        </div>

        {/* Phone Only */}
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92-300-0000000"
          style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
        {otpSent && (
          <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP"
            style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
        )}
        <button onClick={() => { if (!otpSent) setOtpSent(true); else setMode("form"); }}
          style={{width:"100%",padding:"13px",borderRadius:10,background:`linear-gradient(135deg,${pc},${ac})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:14,marginBottom:16}}>
          {otpSent ? "Verify & Continue" : "📱 Send OTP"}
        </button>

        <div style={{background:"#0f1117",borderRadius:10,padding:12,border:"1px solid #4caf5022"}}>
          <div style={{fontSize:11,color:"#4caf50",fontWeight:600,marginBottom:4}}>🔐 Manual Approval Required</div>
          <div style={{fontSize:11,color:"#6b7db3",lineHeight:1.6}}>All registrations are reviewed by admin before access is granted.</div>
        </div>
        <div style={{textAlign:"center",marginTop:14}}>
          <button onClick={() => onLogin("demo")} style={{background:"none",border:"none",color:"#4caf50",cursor:"pointer",fontSize:12,textDecoration:"underline"}}>
            Demo Mode →
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════════════════════════════════════
function Home({ setSection }) {
  const s = useSettings();
  const pc = s.primaryColor; const ac = s.accentColor;
  const partsEnabled = s.partsEnabled !== false;
  const cards = [
    {id:"errors",icon:"🔴",title:"Error Codes",desc:"Fault codes by brand & model",color:"#ff4757"},
    {id:"wiring",icon:"⚡",title:"Wiring Diagrams",desc:"Circuit diagrams & tips",color:ac},
    ...(partsEnabled ? [{id:"parts",icon:"🔩",title:"Part Finder",desc:"Find parts by model number",color:pc}] : []),
    {id:"tips",icon:"💡",title:"Tips & Tricks",desc:"Hidden repair tips by experts",color:"#ffd700"},
    {id:"community",icon:"👥",title:"Community",desc:"Ask & share with technicians",color:"#7c5cfc"},
    {id:"ai",icon:"🤖",title:s.aiName||"PCB AI",desc:"AI-powered repair assistant",color:"#4caf50"},
  ];
  return (
    <div style={{padding:18}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:21,fontWeight:700,color:"#fff",marginBottom:4}}>Welcome, Technician 👋</div>
        <div style={{fontSize:13,color:"#6b7db3"}}>What do you need help with today?</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
        {cards.map(c => (
          <div key={c.id} onClick={() => setSection(c.id)} style={{background:"#1a1f2e",border:`1px solid ${c.color}22`,borderRadius:14,padding:16,cursor:"pointer"}}>
            <div style={{fontSize:26,marginBottom:8}}>{c.icon}</div>
            <div style={{fontWeight:600,fontSize:13,color:"#fff",marginBottom:3}}>{c.title}</div>
            <div style={{fontSize:11,color:"#6b7db3",lineHeight:1.4}}>{c.desc}</div>
          </div>
        ))}
      </div>
      <AdSlot slotId="1234567890"/>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14,border:`1px solid ${ac}22`}}>
        <div style={{fontSize:12,fontWeight:600,color:ac,marginBottom:8}}>⚡ Tip of the Day</div>
        <div style={{fontSize:13,color:"#b0b8d0",lineHeight:1.6}}>Always test the start relay before replacing a compressor. Shake it near your ear — a rattling sound means it is dead. Costs 5% of a compressor and fixes 40% of all compressor failure calls.</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR CODES
// ═══════════════════════════════════════════════════════════════════════════════
function Errors() {
  const s = useSettings();
  const pc = s.primaryColor; const ac = s.accentColor;
  const errors = DB.get("pcb_errors", DEFAULT_ERRORS);
  const brands = DB.get("pcb_brands", DEFAULT_BRANDS);
  const [app, setApp] = useState("");
  const [brand, setBrand] = useState("");
  const [code, setCode] = useState("");
  const codes = app && brand ? (errors[app]?.[brand] || []) : [];
  const err = codes.find(e => e.code === code);
  return (
    <div style={{padding:16}}>
      <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>🔴 Error Code Lookup</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:16}}>Select appliance → brand → error code</div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {[{v:"fridge",l:"🧊 Fridge"},{v:"washing",l:"🌀 Washing"},{v:"ac",l:"❄️ AC"}].map(o => (
          <button key={o.v} onClick={() => {setApp(o.v);setBrand("");setCode("");}}
            style={{flex:1,padding:"10px 4px",borderRadius:10,border:app===o.v?`2px solid ${pc}`:"1px solid #2a3050",background:app===o.v?"#1a2a1a":"#1a1f2e",color:app===o.v?"#fff":"#6b7db3",fontSize:11,cursor:"pointer",fontWeight:600}}>{o.l}</button>
        ))}
      </div>
      {app && <select value={brand} onChange={e => {setBrand(e.target.value);setCode("");}}
        style={{width:"100%",padding:"11px 12px",borderRadius:10,border:"1px solid #2a3050",background:"#1a1f2e",color:brand?"#fff":"#6b7db3",fontSize:13,outline:"none",marginBottom:12}}>
        <option value="">-- Select Brand --</option>
        {(brands[app]||[]).map(b => <option key={b} value={b}>{b}</option>)}
      </select>}
      {brand && codes.length > 0 && <select value={code} onChange={e => setCode(e.target.value)}
        style={{width:"100%",padding:"11px 12px",borderRadius:10,border:"1px solid #2a3050",background:"#1a1f2e",color:code?"#fff":"#6b7db3",fontSize:13,outline:"none",marginBottom:14}}>
        <option value="">-- Select Error Code --</option>
        {codes.map(e => <option key={e.code} value={e.code}>{e.code} — {e.meaning}</option>)}
      </select>}
      {brand && codes.length === 0 && <div style={{background:"#1a1f2e",borderRadius:12,padding:14,textAlign:"center",color:"#6b7db3",fontSize:13}}>No codes for this brand yet. Add via Admin Panel.</div>}
      {err && (
        <div style={{background:"#1a1f2e",borderRadius:14,border:`1px solid ${pc}44`,overflow:"hidden"}}>
          <div style={{background:"#1a2a1a",padding:"14px 16px",borderBottom:"1px solid #2a3050",display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:"#ff475722",borderRadius:8,padding:"5px 11px",color:"#ff4757",fontWeight:700,fontSize:16}}>{err.code}</div>
            <div style={{fontWeight:600,fontSize:14,color:"#fff"}}>{err.meaning}</div>
          </div>
          <div style={{padding:16}}>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:600,color:ac,textTransform:"uppercase",marginBottom:6}}>🔍 Cause</div>
              <div style={{fontSize:13,color:"#b0b8d0",lineHeight:1.6,background:"#0f1117",borderRadius:8,padding:12}}>{err.cause}</div>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:600,color:"#4caf50",textTransform:"uppercase",marginBottom:6}}>🔧 How to Fix</div>
              <div style={{fontSize:13,color:"#b0b8d0",lineHeight:1.6,background:"#0f1117",borderRadius:8,padding:12}}>{err.fix}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WIRING
// ═══════════════════════════════════════════════════════════════════════════════
function Wiring() {
  const s = useSettings();
  const pc = s.primaryColor; const ac = s.accentColor;
  const wiring = DB.get("pcb_wiring", DEFAULT_WIRING);
  const [cat, setCat] = useState(wiring[0]?.category || "");
  const [expanded, setExpanded] = useState(null);
  const [imgModal, setImgModal] = useState(null);
  const current = wiring.find(w => w.category === cat);
  return (
    <div style={{padding:16}}>
      <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>⚡ Wiring Diagrams</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:16}}>Tap a diagram to view full image</div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {wiring.map(w => (
          <button key={w.category} onClick={() => {setCat(w.category);setExpanded(null);}}
            style={{flex:1,padding:"9px 4px",borderRadius:10,border:cat===w.category?`2px solid ${ac}`:"1px solid #2a3050",background:cat===w.category?"#1a2a0a":"#1a1f2e",color:cat===w.category?ac:"#6b7db3",fontSize:11,cursor:"pointer",fontWeight:600}}>
            {w.category==="Fridge"?"🧊":w.category==="Washing"?"🌀":"❄️"} {w.category}
          </button>
        ))}
      </div>
      {current?.items.length === 0 && (
        <div style={{background:"#1a1f2e",borderRadius:14,padding:24,textAlign:"center",border:"1px solid #2a3050"}}>
          <div style={{fontSize:32,marginBottom:10}}>📂</div>
          <div style={{fontSize:13,color:"#6b7db3"}}>No diagrams yet for this category.</div>
          <div style={{fontSize:11,color:"#3a4060",marginTop:6}}>Add diagrams via Admin → Wiring</div>
        </div>
      )}
      {current?.items.map((item, i) => (
        <div key={i} style={{background:"#1a1f2e",borderRadius:14,border:"1px solid #2a3050",marginBottom:12,overflow:"hidden"}}>
          {/* Header */}
          <div onClick={() => setExpanded(expanded===i?null:i)} style={{padding:"13px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:8,background:`${ac}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚡</div>
              <div>
                <div style={{fontWeight:600,fontSize:13,color:"#fff",marginBottom:2}}>{item.title}</div>
                <div style={{fontSize:11,color:"#6b7db3"}}>{item.description}</div>
              </div>
            </div>
            <div style={{color:pc,fontSize:16}}>{expanded===i?"▲":"▼"}</div>
          </div>
          {/* Expanded Content */}
          {expanded===i && (
            <div style={{borderTop:"1px solid #2a3050"}}>
              {/* Image Display */}
              {item.image ? (
                <div style={{padding:12,background:"#0a0d14"}}>
                  <img
                    src={item.image}
                    alt={item.title}
                    onClick={() => setImgModal(item.image)}
                    style={{width:"100%",borderRadius:10,cursor:"pointer",border:`1px solid ${pc}44`,display:"block"}}
                  />
                  <div style={{textAlign:"center",marginTop:8,fontSize:11,color:"#6b7db3"}}>Tap image to view fullscreen</div>
                </div>
              ) : (
                <div style={{padding:24,background:"#0a0d14",textAlign:"center"}}>
                  <div style={{fontSize:36,marginBottom:8}}>🖼️</div>
                  <div style={{fontSize:12,color:"#6b7db3"}}>No image uploaded yet</div>
                  <div style={{fontSize:11,color:"#3a4060",marginTop:4}}>Upload via Admin → Wiring → Edit</div>
                </div>
              )}
              {/* Tips */}
              {item.tips?.length > 0 && (
                <div style={{padding:14}}>
                  <div style={{fontSize:10,fontWeight:600,color:ac,textTransform:"uppercase",marginBottom:8}}>💡 Technician Tips</div>
                  {item.tips.map((t, ti) => (
                    <div key={ti} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
                      <div style={{width:20,height:20,borderRadius:"50%",background:`${ac}22`,color:ac,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700}}>{ti+1}</div>
                      <div style={{fontSize:12,color:"#b0b8d0",lineHeight:1.5}}>{t}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {/* Fullscreen Image Modal */}
      {imgModal && (
        <div onClick={() => setImgModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{position:"relative",maxWidth:"100%",maxHeight:"100%"}}>
            <img src={imgModal} alt="Wiring Diagram" style={{maxWidth:"100%",maxHeight:"90vh",borderRadius:12,objectFit:"contain"}}/>
            <button onClick={() => setImgModal(null)} style={{position:"absolute",top:-14,right:-14,width:32,height:32,borderRadius:"50%",background:"#ff4757",border:"none",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✕</button>
            <div style={{textAlign:"center",marginTop:10,fontSize:11,color:"#6b7db3"}}>Tap anywhere to close</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTS
// ═══════════════════════════════════════════════════════════════════════════════
function Parts() {
  const s = useSettings();
  const pc = s.primaryColor; const ac = s.accentColor;
  const [model, setModel] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const search = async () => {
    if (!model.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({model:"claude-sonnet-4-6",max_tokens:800,messages:[{role:"user",content:`Expert appliance parts advisor. Model number: ${model}. Respond ONLY in JSON, no markdown backticks: {"appliance_type":"...","brand":"...","model":"${model}","common_parts":[{"part_name":"...","part_number":"...","why_needed":"..."}],"search_tip":"..."}`}]})
      });
      const data = await res.json();
      const text = data.content?.map(i => i.text||"").join("") || "";
      setResult(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch { setResult({error:"Could not fetch parts. Please try again."}); }
    setLoading(false);
  };
  const icon = (t) => t==="Fridge"?"🧊":t==="Washing Machine"?"🌀":"❄️";
  return (
    <div style={{padding:16}}>
      <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>🔩 Part Finder</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:16}}>Enter model number to find common parts</div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14,marginBottom:14,border:"1px solid #2a3050"}}>
        <div style={{fontSize:11,fontWeight:600,color:pc,marginBottom:8,textTransform:"uppercase"}}>Model Number</div>
        <div style={{display:"flex",gap:8}}>
          <input value={model} onChange={e => setModel(e.target.value)} onKeyDown={e => e.key==="Enter"&&search()} placeholder="e.g. RF28R7351SR, WM3900HWA..."
            style={{flex:1,padding:"11px 12px",borderRadius:10,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none"}}/>
          <button onClick={search} disabled={loading||!model.trim()}
            style={{padding:"11px 16px",borderRadius:10,background:loading?"#2a3050":`linear-gradient(135deg,${pc},${ac})`,color:"#0a0d14",border:"none",cursor:loading?"default":"pointer",fontWeight:700,fontSize:13}}>
            {loading?"⏳":"Find"}
          </button>
        </div>
        <div style={{fontSize:10,color:"#6b7db3",marginTop:6}}>Model number is on the label inside door or on back panel</div>
      </div>
      {loading && <div style={{background:"#1a1f2e",borderRadius:14,padding:24,textAlign:"center"}}><div style={{fontSize:28,marginBottom:10}}>🔍</div><div style={{color:pc,fontWeight:600,fontSize:14}}>Searching parts database...</div></div>}
      {result && !result.error && (
        <div style={{background:"#1a1f2e",borderRadius:14,border:`1px solid ${pc}44`,overflow:"hidden"}}>
          <div style={{background:"#1a2a1a",padding:"14px 16px",borderBottom:"1px solid #2a3050",display:"flex",gap:10,alignItems:"center"}}>
            <div style={{fontSize:26}}>{icon(result.appliance_type)}</div>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{result.brand} — {result.model}</div>
              <div style={{fontSize:11,color:"#6b7db3"}}>{result.appliance_type}</div>
            </div>
          </div>
          <div style={{padding:16}}>
            <div style={{fontSize:11,fontWeight:600,color:pc,textTransform:"uppercase",marginBottom:10}}>Common Parts</div>
            {result.common_parts?.map((p,i) => (
              <div key={i} style={{background:"#0f1117",borderRadius:10,padding:12,marginBottom:8,borderLeft:`3px solid ${pc}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                  <div style={{fontWeight:600,fontSize:13,color:"#fff"}}>{p.part_name}</div>
                  <div style={{fontSize:10,color:pc,background:`${pc}22`,borderRadius:6,padding:"3px 7px",marginLeft:6,whiteSpace:"nowrap"}}>{p.part_number}</div>
                </div>
                <div style={{fontSize:12,color:"#6b7db3"}}>{p.why_needed}</div>
              </div>
            ))}
            {result.search_tip && <div style={{background:`${ac}11`,borderRadius:10,padding:12,border:`1px solid ${ac}33`,marginTop:4}}><div style={{fontSize:10,fontWeight:600,color:ac,marginBottom:4}}>💡 Tip</div><div style={{fontSize:12,color:"#b0b8d0"}}>{result.search_tip}</div></div>}
          </div>
        </div>
      )}
      {result?.error && <div style={{background:"#1a1f2e",borderRadius:14,padding:16,textAlign:"center",color:"#ff4757",border:"1px solid #ff475733"}}>⚠️ {result.error}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMUNITY
// ═══════════════════════════════════════════════════════════════════════════════
function Community() {
  const s = useSettings();
  const pc = s.primaryColor; const ac = s.accentColor;
  const [posts, setPosts] = useState(() => DB.get("pcb_posts", DEMO_POSTS));
  const [newPost, setNewPost] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState("");
  const [aiThinking, setAiThinking] = useState(null);
  useEffect(() => DB.set("pcb_posts", posts), [posts]);

  const submitPost = async () => {
    const mod = moderate(newPost, s);
    if (mod.blocked) { setError(mod.reason); return; }
    if (!newPost.trim()) return;
    const post = {id:"p"+Date.now(),author:"You",avatar:"YO",time:"Just now",text:newPost,replies:[]};
    setPosts(prev => [post, ...prev]);
    setNewPost(""); setError("");
    setAiThinking(post.id);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({model:"claude-sonnet-4-6",max_tokens:250,messages:[{role:"user",content:`You are PCB AI, a helpful appliance repair bot in a technician community. A technician posted: "${newPost}". Give a brief practical reply in 2-3 sentences max. Be direct and technical.`}]})
      });
      const data = await res.json();
      const reply = data.content?.map(i => i.text||"").join("") || "Good question! Check the most common failure points for this issue.";
      setPosts(prev => prev.map(p => p.id===post.id ? {...p,replies:[...p.replies,{author:"PCB AI 🤖",avatar:"AI",time:"Just now",text:reply}]} : p));
    } catch {}
    setAiThinking(null);
  };

  const submitReply = (postId) => {
    const mod = moderate(replyText, s);
    if (mod.blocked) { setError(mod.reason); return; }
    if (!replyText.trim()) return;
    setPosts(prev => prev.map(p => p.id===postId ? {...p,replies:[...p.replies,{author:"You",avatar:"YO",time:"Just now",text:replyText}]} : p));
    setReplyText(""); setReplyTo(null); setError("");
  };

  return (
    <div style={{padding:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:"#fff"}}>👥 Technician Community</div>
          <div style={{fontSize:11,color:"#4caf50"}}>🤖 AI Bot Active — Moderating posts</div>
        </div>
      </div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14,marginBottom:14,border:"1px solid #2a3050"}}>
        <textarea value={newPost} onChange={e => {setNewPost(e.target.value);setError("");}} placeholder="Ask a repair question or share a tip... (No phone numbers, URLs, or abusive language)" rows={3}
          style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
        {error && <div style={{color:"#ff4757",fontSize:12,marginTop:4,padding:"6px 10px",background:"#ff475711",borderRadius:6}}>⚠️ {error}</div>}
        <button onClick={submitPost} disabled={!newPost.trim()} style={{marginTop:8,padding:"10px 20px",borderRadius:10,background:`linear-gradient(135deg,${pc},${ac})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:13}}>Post Question</button>
      </div>
      {posts.map(post => (
        <div key={post.id} style={{background:"#1a1f2e",borderRadius:14,border:"1px solid #2a3050",marginBottom:12,overflow:"hidden"}}>
          <div style={{padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${pc},${ac})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#0a0d14",flexShrink:0}}>{post.avatar}</div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"#fff"}}>{post.author}</div>
                <div style={{fontSize:11,color:"#6b7db3"}}>{post.time}</div>
              </div>
            </div>
            <div style={{fontSize:13,color:"#e8eaf0",lineHeight:1.6}}>{post.text}</div>
          </div>
          {post.replies.length > 0 && (
            <div style={{borderTop:"1px solid #2a3050"}}>
              {post.replies.map((r,i) => (
                <div key={i} style={{padding:"10px 16px 10px 26px",borderBottom:i<post.replies.length-1?"1px solid #1a1f2e":"none",background:r.author.includes("AI")?"#0f1117":"transparent"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:r.author.includes("AI")?"#4caf5033":"#2a3050",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:r.author.includes("AI")?"#4caf50":"#e8eaf0",flexShrink:0}}>{r.avatar}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:r.author.includes("AI")?"#4caf50":"#fff"}}>{r.author}</div>
                      <div style={{fontSize:10,color:"#6b7db3"}}>{r.time}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:"#b0b8d0",lineHeight:1.5}}>{r.text}</div>
                </div>
              ))}
            </div>
          )}
          {aiThinking===post.id && (
            <div style={{padding:"10px 16px",borderTop:"1px solid #2a3050",background:"#0f1117",display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"#4caf5033",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🤖</div>
              <div style={{fontSize:12,color:"#4caf50"}}>PCB AI is thinking...</div>
            </div>
          )}
          <div style={{padding:"8px 16px 12px",borderTop:"1px solid #2a3050"}}>
            {replyTo===post.id ? (
              <div>
                <input value={replyText} onChange={e => {setReplyText(e.target.value);setError("");}} placeholder="Write a reply..."
                  style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:6}}/>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={() => submitReply(post.id)} style={{padding:"7px 14px",borderRadius:8,background:pc,color:"#0a0d14",border:"none",cursor:"pointer",fontSize:12,fontWeight:600}}>Reply</button>
                  <button onClick={() => {setReplyTo(null);setError("");}} style={{padding:"7px 14px",borderRadius:8,background:"#2a3050",color:"#6b7db3",border:"none",cursor:"pointer",fontSize:12}}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setReplyTo(post.id)} style={{background:"none",border:"none",color:"#6b7db3",cursor:"pointer",fontSize:12,padding:"4px 0"}}>💬 Reply ({post.replies.length})</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI ASSISTANT
// ═══════════════════════════════════════════════════════════════════════════════
function AIChat() {
  const s = useSettings();
  const pc = s.primaryColor; const ac = s.accentColor;
  const DAILY_LIMIT = 5;
  const today = new Date().toISOString().split("T")[0];
  const usageKey = "pcb_ai_usage_" + today;
  const [usage, setUsage] = useState(() => DB.get(usageKey, 0));
  const [msgs, setMsgs] = useState([{role:"assistant",text:`Hi! I am ${s.aiName||"PCB AI"}, your expert appliance repair assistant. Ask me anything about fridge, washing machine, or AC faults! You have ${DAILY_LIMIT - DB.get(usageKey,0)} questions remaining today.`}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  const remaining = DAILY_LIMIT - usage;

  const send = async () => {
    if (!input.trim() || loading) return;
    if (usage >= DAILY_LIMIT) return;
    const q = input.trim(); setInput("");
    const newUsage = usage + 1;
    setUsage(newUsage);
    DB.set(usageKey, newUsage);
    setMsgs(m => [...m,{role:"user",text:q}]);
    setLoading(true);
    try {
      const useCustom = s.aiUrl && s.aiToken;
      let reply = "";
      if (useCustom) {
        const res = await fetch(s.aiUrl,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${s.aiToken}`},body:JSON.stringify({message:q})});
        const data = await res.json();
        reply = data.reply||data.response||data.message||data.content||"Response received.";
      } else {
        const res = await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:800,messages:[{role:"user",content:`You are ${s.aiName||"PCB AI"}, expert appliance repair assistant for PCB Care. Specialise in fridges, washing machines, and ACs. Be concise and practical. User: ${q}`}]})
        });
        const data = await res.json();
        reply = data.content?.map(i => i.text||"").join("")||"Sorry, connection issue.";
      }
      const leftAfter = DAILY_LIMIT - newUsage;
      if (leftAfter > 0) reply += " (" + leftAfter + " question" + (leftAfter===1?"":"s") + " remaining today)";
      else reply += " - Daily limit reached. Come back tomorrow!";
      setMsgs(m => [...m,{role:"assistant",text:reply}]);
    } catch { setMsgs(m => [...m,{role:"assistant",text:"Connection error. Please try again."}]); }
    setLoading(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 130px)"}}>
      <div style={{padding:"14px 16px 10px",borderBottom:"1px solid #2a3050",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:"#fff"}}>🤖 {s.aiName||"PCB AI"}</div>
          <div style={{fontSize:11,color:"#4caf50"}}>AI-powered appliance repair expert</div>
        </div>
        <div style={{background: remaining > 2 ? "#4caf5022" : remaining > 0 ? "#ffa50222" : "#ff475722", borderRadius:20,padding:"6px 12px",border:`1px solid ${remaining > 2 ? "#4caf5044" : remaining > 0 ? "#ffa50244" : "#ff475744"}`}}>
          <div style={{fontSize:11,fontWeight:700,color: remaining > 2 ? "#4caf50" : remaining > 0 ? "#ffa502" : "#ff4757"}}>{remaining}/{DAILY_LIMIT} left today</div>
        </div>
      </div>

      {/* Usage bar */}
      <div style={{padding:"8px 16px",borderBottom:"1px solid #2a3050",background:"#0f1117"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{fontSize:10,color:"#6b7db3"}}>Daily AI Questions</div>
          <div style={{fontSize:10,color:"#6b7db3"}}>{usage}/{DAILY_LIMIT} used</div>
        </div>
        <div style={{height:4,background:"#2a3050",borderRadius:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(usage/DAILY_LIMIT)*100}%`,background: usage < 3 ? "#4caf50" : usage < 5 ? "#ffa502" : "#ff4757",borderRadius:4,transition:"width 0.3s"}}/>
        </div>
        {remaining === 0 && (
          <div style={{marginTop:6,fontSize:11,color:"#ff4757",textAlign:"center"}}>Daily limit reached. Resets at midnight 🔄</div>
        )}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i) => (
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"83%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?`linear-gradient(135deg,${pc},${ac})`:"#1a1f2e",fontSize:13,color:"#e8eaf0",lineHeight:1.6,border:m.role==="assistant"?"1px solid #2a3050":"none",whiteSpace:"pre-wrap"}}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div style={{display:"flex",justifyContent:"flex-start"}}><div style={{background:"#1a1f2e",border:"1px solid #2a3050",borderRadius:"14px 14px 14px 4px",padding:"10px 16px",color:"#6b7db3",fontSize:13}}>Thinking...</div></div>}
        <div ref={bottomRef}/>
      </div>

      <div style={{padding:"10px 14px",borderTop:"1px solid #2a3050",display:"flex",gap:8}}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&send()}
          placeholder={remaining > 0 ? "Ask about any appliance fault..." : "Daily limit reached. Come back tomorrow."}
          disabled={remaining === 0}
          style={{flex:1,padding:"11px 14px",borderRadius:12,border:"1px solid #2a3050",background: remaining===0 ? "#0a0d14" : "#1a1f2e",color: remaining===0 ? "#3a4060" : "#fff",fontSize:13,outline:"none"}}/>
        <button onClick={send} disabled={loading||!input.trim()||remaining===0}
          style={{width:44,height:44,borderRadius:12,background:loading||remaining===0?"#2a3050":`linear-gradient(135deg,${pc},${ac})`,border:"none",cursor:loading||remaining===0?"default":"pointer",fontSize:16,color:"#0a0d14",display:"flex",alignItems:"center",justifyContent:"center"}}>➤</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPS & TRICKS
// ═══════════════════════════════════════════════════════════════════════════════
function TipsTricks() {
  const s = useSettings();
  const pc = s.primaryColor; const ac = s.accentColor;
  const tips = DB.get("pcb_tips", []);
  const [selected, setSelected] = useState(null);

  if (tips.length === 0) return (
    <div style={{padding:16}}>
      <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>💡 Tips & Tricks</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:20}}>Hidden tips and tricks from expert technicians</div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:32,textAlign:"center",border:"1px solid #2a3050"}}>
        <div style={{fontSize:40,marginBottom:12}}>💡</div>
        <div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:6}}>No Tips Yet</div>
        <div style={{fontSize:12,color:"#6b7db3"}}>Admin will publish tips and tricks soon. Stay tuned!</div>
      </div>
    </div>
  );

  return (
    <div style={{padding:16}}>
      <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>💡 Tips & Tricks</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:16}}>Expert repair tips — tap to expand</div>
      {tips.map((tip, i) => (
        <div key={i} style={{background:"#1a1f2e",borderRadius:14,border:`1px solid ${ac}22`,marginBottom:12,overflow:"hidden"}}>
          <div onClick={() => setSelected(selected===i?null:i)} style={{padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:10,background:`${ac}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>💡</div>
              <div>
                <div style={{fontWeight:600,fontSize:13,color:"#fff",marginBottom:2}}>{tip.title}</div>
                <div style={{fontSize:11,color:"#6b7db3"}}>{tip.category||"General"}</div>
              </div>
            </div>
            <div style={{color:ac,fontSize:16,flexShrink:0}}>{selected===i?"▲":"▼"}</div>
          </div>
          {selected===i && (
            <div style={{borderTop:"1px solid #2a3050"}}>
              <div style={{padding:"14px 16px"}}>
                <div style={{fontSize:13,color:"#e8eaf0",lineHeight:1.7,marginBottom:14}}>{tip.description}</div>
                {/* Media: Image */}
                {tip.mediaType==="image" && tip.mediaUrl && (
                  <div style={{marginBottom:12}}>
                    <img src={tip.mediaUrl} alt={tip.title} style={{width:"100%",borderRadius:10,border:`1px solid ${ac}33`}} onError={e => e.target.style.display="none"}/>
                  </div>
                )}
                {/* Media: Video URL (YouTube/etc) */}
                {tip.mediaType==="video_url" && tip.mediaUrl && (
                  <div style={{marginBottom:12}}>
                    <a href={tip.mediaUrl} target="_blank" rel="noreferrer"
                      style={{display:"flex",alignItems:"center",gap:10,background:`${ac}11`,borderRadius:10,padding:"12px 16px",border:`1px solid ${ac}33`,textDecoration:"none"}}>
                      <div style={{fontSize:24}}>▶️</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:ac}}>Watch Video</div>
                        <div style={{fontSize:11,color:"#6b7db3",marginTop:2}}>Tap to open in browser</div>
                      </div>
                    </a>
                  </div>
                )}
                {/* Media: Uploaded image base64 */}
                {tip.mediaType==="upload" && tip.mediaData && (
                  <div style={{marginBottom:12}}>
                    <img src={tip.mediaData} alt={tip.title} style={{width:"100%",borderRadius:10,border:`1px solid ${ac}33`}}/>
                  </div>
                )}
                <div style={{fontSize:10,color:"#3a4060"}}>Published by Admin</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — INSIGHTS
// ═══════════════════════════════════════════════════════════════════════════════
function AdminInsights({ pc, ac, online }) {
  const errors = DB.get("pcb_errors", DEFAULT_ERRORS);
  const users = DB.get("pcb_users", DEMO_USERS);
  const posts = DB.get("pcb_posts", DEMO_POSTS);
  const s = useSettings();
  const totalCodes = Object.values(errors).reduce((a,b) => a+Object.values(b).reduce((c,d) => c+d.length,0),0);
  const stats = [
    {label:"🟢 Users Online Now",value:online,color:"#4caf50",live:true},
    {label:"⏳ Pending Approvals",value:users.pending.length,color:"#ffa502"},
    {label:"✅ Approved Users",value:users.approved.length,color:pc},
    {label:"🗣️ Community Posts",value:posts.length,color:"#7c5cfc"},
    {label:"🔴 Error Codes",value:totalCodes,color:"#ff4757"},
    {label:"💰 AdSense",value:s.adsEnabled?"Active":"Off",color:s.adsEnabled?"#4caf50":"#ff4757"},
  ];
  return (
    <div>
      <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:4}}>📊 Live Insights</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:16}}>Real-time platform overview</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        {stats.map((s,i) => (
          <div key={i} style={{background:"#1a1f2e",borderRadius:14,padding:14,border:`1px solid ${s.color}22`}}>
            {s.live && <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}><div style={{width:7,height:7,borderRadius:"50%",background:"#4caf50",boxShadow:"0 0 6px #4caf50"}}/><div style={{fontSize:9,color:"#4caf50",fontWeight:700,textTransform:"uppercase"}}>Live</div></div>}
            <div style={{fontSize:26,fontWeight:800,color:s.color,marginBottom:4}}>{s.value}</div>
            <div style={{fontSize:11,color:"#6b7db3"}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:16,border:`1px solid ${ac}22`}}>
        <div style={{fontSize:12,fontWeight:600,color:ac,marginBottom:8}}>🔥 Firebase Ready</div>
        <div style={{fontSize:12,color:"#b0b8d0",lineHeight:1.7}}>Replace FIREBASE_CONFIG in the source code with your project credentials to enable live Google, Facebook, and Phone authentication with real user data stored in Firestore.</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — USERS
// ═══════════════════════════════════════════════════════════════════════════════
function AdminUsers({ pc, ac }) {
  const [users, setUsers] = useState(() => DB.get("pcb_users", DEMO_USERS));
  const [view, setView] = useState("pending");
  useEffect(() => DB.set("pcb_users", users), [users]);
  const approve = id => { const u = users.pending.find(x => x.id===id); if (!u) return; setUsers({pending:users.pending.filter(x=>x.id!==id),approved:[...users.approved,{...u,muted:false}]}); };
  const reject = id => setUsers(u => ({...u,pending:u.pending.filter(x=>x.id!==id)}));
  const toggleMute = id => setUsers(u => ({...u,approved:u.approved.map(x=>x.id===id?{...x,muted:!x.muted}:x)}));
  const remove = id => setUsers(u => ({...u,approved:u.approved.filter(x=>x.id!==id)}));
  return (
    <div>
      <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:12}}>👥 User Management</div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[{v:"pending",l:`⏳ Pending (${users.pending.length})`},{v:"approved",l:`✅ Approved (${users.approved.length})`}].map(o => (
          <button key={o.v} onClick={() => setView(o.v)} style={{flex:1,padding:"9px",borderRadius:10,border:view===o.v?`2px solid ${pc}`:"1px solid #2a3050",background:view===o.v?"#1a2a1a":"#1a1f2e",color:view===o.v?"#fff":"#6b7db3",fontSize:12,cursor:"pointer",fontWeight:600}}>{o.l}</button>
        ))}
      </div>
      {view==="pending" && users.pending.length===0 && <div style={{textAlign:"center",color:"#6b7db3",padding:20,fontSize:13}}>No pending approvals 🎉</div>}
      {view==="pending" && users.pending.map(u => (
        <div key={u.id} style={{background:"#1a1f2e",borderRadius:12,padding:14,marginBottom:10,border:"1px solid #ffa50222"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#4caf50,#ffd700)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"#0a0d14",flexShrink:0}}>
              {u.name?.charAt(0)?.toUpperCase()||"?"}
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{u.name}</div>
              <div style={{fontSize:11,color:"#6b7db3"}}>Via {u.method} · {u.joined}</div>
            </div>
          </div>
          <div style={{background:"#0f1117",borderRadius:10,padding:12,marginBottom:10}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div>
                <div style={{fontSize:10,color:"#6b7db3",marginBottom:2}}>📧 Email</div>
                <div style={{fontSize:12,color:"#e8eaf0"}}>{u.email||"—"}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:"#6b7db3",marginBottom:2}}>📱 Phone</div>
                <div style={{fontSize:12,color:"#e8eaf0"}}>{u.phone||"—"}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:"#6b7db3",marginBottom:2}}>🌍 Country</div>
                <div style={{fontSize:12,color:"#e8eaf0"}}>{u.country||"—"}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:"#6b7db3",marginBottom:2}}>🗺️ State</div>
                <div style={{fontSize:12,color:"#e8eaf0"}}>{u.state||"—"}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:"#6b7db3",marginBottom:2}}>🏙️ City</div>
                <div style={{fontSize:12,color:"#e8eaf0"}}>{u.city||"—"}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:"#6b7db3",marginBottom:2}}>🔧 Experience</div>
                <div style={{fontSize:12,color:"#e8eaf0"}}>{u.experience||"—"}</div>
              </div>
            </div>
            {u.specialization && (
              <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid #2a3050"}}>
                <div style={{fontSize:10,color:"#6b7db3",marginBottom:2}}>⚙️ Specialization</div>
                <div style={{fontSize:12,color:"#ffd700",fontWeight:600}}>{u.specialization}</div>
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={() => approve(u.id)} style={{flex:1,padding:"10px",borderRadius:8,background:"#4caf5022",color:"#4caf50",border:"1px solid #4caf5044",cursor:"pointer",fontSize:12,fontWeight:700}}>✅ Approve</button>
            <button onClick={() => reject(u.id)} style={{flex:1,padding:"10px",borderRadius:8,background:"#ff475722",color:"#ff4757",border:"1px solid #ff475744",cursor:"pointer",fontSize:12,fontWeight:700}}>❌ Reject</button>
          </div>
        </div>
      ))}
      {view==="approved" && users.approved.map(u => (
        <div key={u.id} style={{background:"#1a1f2e",borderRadius:12,padding:14,marginBottom:10,border:"1px solid #2a3050"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontWeight:600,fontSize:14,color:u.muted?"#6b7db3":"#fff",marginBottom:4}}>{u.name} {u.muted?"🔇":""}</div>
              <div style={{fontSize:12,color:"#6b7db3",marginBottom:2}}>📧 {u.email}</div>
              <div style={{fontSize:12,color:"#6b7db3"}}>📱 {u.phone}</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={() => toggleMute(u.id)} style={{padding:"6px 10px",borderRadius:7,background:"#ffa50222",color:"#ffa502",border:"none",cursor:"pointer",fontSize:11}}>{u.muted?"🔊":"🔇"}</button>
              <button onClick={() => remove(u.id)} style={{padding:"6px 10px",borderRadius:7,background:"#ff475722",color:"#ff4757",border:"none",cursor:"pointer",fontSize:11}}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — BRANDS
// ═══════════════════════════════════════════════════════════════════════════════
function AdminBrands({ pc, ac }) {
  const [brands, setBrands] = useState(() => DB.get("pcb_brands", DEFAULT_BRANDS));
  const [app, setApp] = useState("fridge");
  const [newB, setNewB] = useState("");
  useEffect(() => DB.set("pcb_brands", brands), [brands]);
  const add = () => { if (!newB.trim()) return; setBrands(b => ({...b,[app]:[...(b[app]||[]),newB.trim()]})); setNewB(""); };
  const del = b => setBrands(prev => ({...prev,[app]:prev[app].filter(x=>x!==b)}));
  return (
    <div>
      <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:14}}>🏷️ Manage Brands</div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[{v:"fridge",l:"🧊 Fridge"},{v:"washing",l:"🌀 Washing"},{v:"ac",l:"❄️ AC"}].map(o => (
          <button key={o.v} onClick={() => setApp(o.v)} style={{flex:1,padding:"9px",borderRadius:9,border:app===o.v?`2px solid ${pc}`:"1px solid #2a3050",background:app===o.v?"#1a2a1a":"#1a1f2e",color:app===o.v?"#fff":"#6b7db3",fontSize:12,cursor:"pointer",fontWeight:600}}>{o.l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <input value={newB} onChange={e => setNewB(e.target.value)} onKeyDown={e => e.key==="Enter"&&add()} placeholder="New brand name..."
          style={{flex:1,padding:"11px 12px",borderRadius:10,border:"1px solid #2a3050",background:"#1a1f2e",color:"#fff",fontSize:13,outline:"none"}}/>
        <button onClick={add} style={{padding:"11px 16px",borderRadius:10,background:`linear-gradient(135deg,${pc},${ac})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700}}>+ Add</button>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {(brands[app]||[]).map(b => (
          <div key={b} style={{display:"flex",alignItems:"center",gap:6,background:"#1a1f2e",borderRadius:8,padding:"7px 12px",border:"1px solid #2a3050"}}>
            <span style={{fontSize:13,color:"#e8eaf0"}}>{b}</span>
            <button onClick={() => del(b)} style={{background:"none",border:"none",color:"#ff4757",cursor:"pointer",fontSize:14,lineHeight:1,padding:0}}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — ERRORS
// ═══════════════════════════════════════════════════════════════════════════════
function AdminErrors({ pc, ac }) {
  const [errors, setErrors] = useState(() => DB.get("pcb_errors", DEFAULT_ERRORS));
  const [brands] = useState(() => DB.get("pcb_brands", DEFAULT_BRANDS));
  const [app, setApp] = useState("fridge");
  const [brand, setBrand] = useState("");
  const [form, setForm] = useState({code:"",meaning:"",cause:"",fix:""});
  const [editIdx, setEditIdx] = useState(null);
  useEffect(() => DB.set("pcb_errors", errors), [errors]);
  const codes = brand ? (errors[app]?.[brand]||[]) : [];
  const save = () => {
    if (!brand||!form.code) return;
    setErrors(prev => { const u={...prev}; if (!u[app]) u[app]={}; if (!u[app][brand]) u[app][brand]=[]; const list=[...u[app][brand]]; if (editIdx!==null) list[editIdx]={...form}; else list.push({...form}); u[app][brand]=list; return u; });
    setForm({code:"",meaning:"",cause:"",fix:""}); setEditIdx(null);
  };
  const del = i => setErrors(prev => { const u={...prev}; u[app][brand]=u[app][brand].filter((_,idx)=>idx!==i); return u; });
  return (
    <div>
      <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:12}}>🔴 Manage Error Codes</div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {[{v:"fridge",l:"🧊 Fridge"},{v:"washing",l:"🌀 Washing"},{v:"ac",l:"❄️ AC"}].map(o => (
          <button key={o.v} onClick={() => {setApp(o.v);setBrand("");}} style={{flex:1,padding:"9px",borderRadius:9,border:app===o.v?`2px solid ${pc}`:"1px solid #2a3050",background:app===o.v?"#1a2a1a":"#1a1f2e",color:app===o.v?"#fff":"#6b7db3",fontSize:12,cursor:"pointer",fontWeight:600}}>{o.l}</button>
        ))}
      </div>
      <select value={brand} onChange={e => setBrand(e.target.value)} style={{width:"100%",padding:"11px 12px",borderRadius:10,border:"1px solid #2a3050",background:"#1a1f2e",color:brand?"#fff":"#6b7db3",fontSize:13,outline:"none",marginBottom:14}}>
        <option value="">-- Select Brand --</option>
        {(brands[app]||[]).map(b => <option key={b} value={b}>{b}</option>)}
      </select>
      {brand && <>
        <div style={{background:"#1a1f2e",borderRadius:14,padding:14,border:`1px solid ${pc}33`,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:600,color:pc,marginBottom:10}}>{editIdx!==null?"✏️ Edit":"➕ Add"} Error Code</div>
          {[["code","Error Code (e.g. E1)"],["meaning","Meaning"],["cause","Cause"],["fix","How to Fix"]].map(([f,ph]) => (
            <input key={f} value={form[f]} onChange={e => setForm(x => ({...x,[f]:e.target.value}))} placeholder={ph}
              style={{width:"100%",padding:"10px 12px",borderRadius:9,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:12,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
          ))}
          <div style={{display:"flex",gap:8}}>
            <button onClick={save} style={{flex:1,padding:"11px",borderRadius:9,background:`linear-gradient(135deg,${pc},${ac})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:13}}>{editIdx!==null?"Update":"Add Code"}</button>
            {editIdx!==null && <button onClick={() => {setForm({code:"",meaning:"",cause:"",fix:""});setEditIdx(null);}} style={{padding:"11px 14px",borderRadius:9,background:"#2a3050",color:"#6b7db3",border:"none",cursor:"pointer"}}>Cancel</button>}
          </div>
        </div>
        <div style={{fontSize:11,color:"#6b7db3",marginBottom:8}}>{codes.length} codes for {brand}</div>
        {codes.map((c,i) => (
          <div key={i} style={{background:"#1a1f2e",borderRadius:12,padding:12,marginBottom:8,border:"1px solid #2a3050",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:2}}>
                <div style={{background:"#ff475722",color:"#ff4757",borderRadius:6,padding:"2px 8px",fontSize:12,fontWeight:700}}>{c.code}</div>
                <div style={{fontSize:12,color:"#e8eaf0",fontWeight:600}}>{c.meaning}</div>
              </div>
              <div style={{fontSize:11,color:"#6b7db3"}}>{c.cause}</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={() => {setForm({...c});setEditIdx(i);}} style={{background:`${pc}22`,border:"none",borderRadius:7,padding:"5px 8px",color:pc,cursor:"pointer",fontSize:11}}>✏️</button>
              <button onClick={() => del(i)} style={{background:"#ff475722",border:"none",borderRadius:7,padding:"5px 8px",color:"#ff4757",cursor:"pointer",fontSize:11}}>🗑️</button>
            </div>
          </div>
        ))}
      </>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — WIRING
// ═══════════════════════════════════════════════════════════════════════════════
function AdminWiring({ pc, ac }) {
  const [wiring, setWiring] = useState(() => DB.get("pcb_wiring", DEFAULT_WIRING));
  const [ci, setCi] = useState(0);
  const [form, setForm] = useState({title:"",description:"",image:"",tips:""});
  const [editIdx, setEditIdx] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = React.useRef(null);
  useEffect(() => DB.set("pcb_wiring", wiring), [wiring]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image too large. Max 5MB."); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setForm(f => ({...f, image: base64}));
      setPreview(base64);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form.title) return;
    const item = {...form, tips: form.tips.split("\n").filter(Boolean)};
    setWiring(w => {
      const u = [...w];
      const items = [...u[ci].items];
      if (editIdx !== null) items[editIdx] = item; else items.push(item);
      u[ci] = {...u[ci], items};
      return u;
    });
    setForm({title:"",description:"",image:"",tips:""});
    setPreview(null);
    setEditIdx(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const del = (i) => setWiring(w => {
    const u = [...w];
    u[ci] = {...u[ci], items: u[ci].items.filter((_,idx) => idx!==i)};
    return u;
  });

  const startEdit = (i) => {
    const item = wiring[ci].items[i];
    setForm({...item, tips: item.tips.join("\n")});
    setPreview(item.image || null);
    setEditIdx(i);
  };

  return (
    <div>
      <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:4}}>⚡ Wiring Diagrams</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:14}}>Upload real wiring diagram images</div>

      {/* Category Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {wiring.map((w,i) => (
          <button key={i} onClick={() => {setCi(i);setEditIdx(null);setForm({title:"",description:"",image:"",tips:""});setPreview(null);}}
            style={{flex:1,padding:"9px",borderRadius:9,border:ci===i?`2px solid ${ac}`:"1px solid #2a3050",background:ci===i?"#1a2a0a":"#1a1f2e",color:ci===i?ac:"#6b7db3",fontSize:11,cursor:"pointer",fontWeight:600}}>
            {w.category==="Fridge"?"🧊":w.category==="Washing"?"🌀":"❄️"} {w.category}
          </button>
        ))}
      </div>

      {/* Add / Edit Form */}
      <div style={{background:"#1a1f2e",borderRadius:14,padding:16,border:`1px solid ${ac}33`,marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:600,color:ac,marginBottom:12}}>{editIdx!==null?"✏️ Edit Diagram":"➕ Add New Diagram"}</div>

        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,color:"#6b7db3",marginBottom:5}}>Diagram Title</div>
          <input value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))} placeholder="e.g. Compressor Circuit Wiring"
            style={{width:"100%",padding:"11px 12px",borderRadius:9,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
        </div>

        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,color:"#6b7db3",marginBottom:5}}>Short Description</div>
          <input value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))} placeholder="e.g. Start relay, overload protector connections"
            style={{width:"100%",padding:"11px 12px",borderRadius:9,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
        </div>

        {/* Image Upload */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:"#6b7db3",marginBottom:8}}>Wiring Diagram Image</div>
          {/* Preview */}
          {preview ? (
            <div style={{marginBottom:10,position:"relative"}}>
              <img src={preview} alt="preview" style={{width:"100%",borderRadius:10,border:`1px solid ${ac}44`,display:"block",maxHeight:220,objectFit:"contain",background:"#0a0d14"}}/>
              <button onClick={() => {setPreview(null);setForm(f => ({...f,image:""}));if(fileRef.current)fileRef.current.value="";}}
                style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:"50%",background:"#ff4757",border:"none",color:"#fff",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              <div style={{textAlign:"center",marginTop:6,fontSize:11,color:"#4caf50"}}>✅ Image ready</div>
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()}
              style={{border:`2px dashed ${ac}44`,borderRadius:10,padding:24,textAlign:"center",cursor:"pointer",background:"#0a0d14"}}>
              <div style={{fontSize:32,marginBottom:8}}>🖼️</div>
              <div style={{fontSize:13,fontWeight:600,color:ac,marginBottom:4}}>{uploading?"Uploading...":"Tap to Upload Image"}</div>
              <div style={{fontSize:11,color:"#6b7db3"}}>JPG, PNG, or WebP — Max 5MB</div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display:"none"}}/>
          {!preview && (
            <button onClick={() => fileRef.current?.click()}
              style={{width:"100%",marginTop:8,padding:"11px",borderRadius:9,background:`${ac}22`,color:ac,border:`1px solid ${ac}44`,cursor:"pointer",fontWeight:600,fontSize:13}}>
              📁 Browse & Upload Image
            </button>
          )}
        </div>

        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:"#6b7db3",marginBottom:5}}>Technician Tips (one per line)</div>
          <textarea value={form.tips} onChange={e => setForm(f => ({...f,tips:e.target.value}))} placeholder={"Tip 1\nTip 2\nTip 3"} rows={4}
            style={{width:"100%",padding:"11px 12px",borderRadius:9,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}}/>
        </div>

        <div style={{display:"flex",gap:8}}>
          <button onClick={save} style={{flex:1,padding:"12px",borderRadius:9,background:`linear-gradient(135deg,${ac},${pc})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:13}}>
            {editIdx!==null?"✅ Update Diagram":"➕ Add Diagram"}
          </button>
          {editIdx!==null && (
            <button onClick={() => {setForm({title:"",description:"",image:"",tips:""});setPreview(null);setEditIdx(null);if(fileRef.current)fileRef.current.value="";}}
              style={{padding:"12px 16px",borderRadius:9,background:"#2a3050",color:"#6b7db3",border:"none",cursor:"pointer",fontSize:13}}>Cancel</button>
          )}
        </div>
      </div>

      {/* Existing Diagrams List */}
      <div style={{fontSize:12,fontWeight:600,color:"#6b7db3",marginBottom:10}}>
        {wiring[ci]?.items.length || 0} diagrams in {wiring[ci]?.category}
      </div>
      {wiring[ci]?.items.map((item,i) => (
        <div key={i} style={{background:"#1a1f2e",borderRadius:12,border:"1px solid #2a3050",marginBottom:10,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px"}}>
            {/* Thumbnail */}
            {item.image ? (
              <img src={item.image} alt="" style={{width:56,height:42,borderRadius:7,objectFit:"cover",border:`1px solid ${ac}33`,flexShrink:0}}/>
            ) : (
              <div style={{width:56,height:42,borderRadius:7,background:"#0f1117",border:"1px dashed #2a3050",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🖼️</div>
            )}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:"#fff",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
              <div style={{fontSize:11,color:"#6b7db3",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.description}</div>
              <div style={{fontSize:10,color:"#3a4060",marginTop:2}}>{item.tips?.length||0} tips · {item.image?"Image ✅":"No image ⚠️"}</div>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button onClick={() => startEdit(i)} style={{background:`${ac}22`,border:"none",borderRadius:7,padding:"7px 10px",color:ac,cursor:"pointer",fontSize:12}}>✏️</button>
              <button onClick={() => del(i)} style={{background:"#ff475722",border:"none",borderRadius:7,padding:"7px 10px",color:"#ff4757",cursor:"pointer",fontSize:12}}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
      {wiring[ci]?.items.length === 0 && (
        <div style={{textAlign:"center",padding:20,color:"#6b7db3",fontSize:13}}>No diagrams yet. Add your first one above! 👆</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — TIPS & TRICKS
// ═══════════════════════════════════════════════════════════════════════════════
function AdminTips({ pc, ac }) {
  const [tips, setTips] = useState(() => DB.get("pcb_tips", []));
  const [form, setForm] = useState({title:"",category:"",description:"",mediaType:"none",mediaUrl:"",mediaData:""});
  const [editIdx, setEditIdx] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = React.useRef(null);
  useEffect(() => DB.set("pcb_tips", tips), [tips]);

  const CATEGORIES = ["Fridge","Washing Machine","AC","General","Safety","Tools"];

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { alert("Max 5MB"); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = ev => {
      setForm(f => ({...f, mediaData: ev.target.result, mediaType:"upload"}));
      setPreview(ev.target.result);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form.title || !form.description) return;
    const item = {...form};
    setTips(prev => {
      const arr = [...prev];
      if (editIdx !== null) arr[editIdx] = item; else arr.unshift(item);
      return arr;
    });
    setForm({title:"",category:"",description:"",mediaType:"none",mediaUrl:"",mediaData:""});
    setPreview(null); setEditIdx(null);
    if (fileRef.current) fileRef.current.value="";
  };

  const del = i => setTips(prev => prev.filter((_,idx) => idx!==i));
  const edit = i => {
    const t = tips[i];
    setForm({...t});
    setPreview(t.mediaType==="upload"?t.mediaData:null);
    setEditIdx(i);
  };

  return (
    <div>
      <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:4}}>💡 Tips & Tricks</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:16}}>Publish hidden tips with image or video reference</div>

      <div style={{background:"#1a1f2e",borderRadius:14,padding:16,border:`1px solid ${ac}33`,marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:600,color:ac,marginBottom:12}}>{editIdx!==null?"✏️ Edit Tip":"➕ Add New Tip"}</div>

        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,color:"#6b7db3",marginBottom:5}}>Title <span style={{color:"#ff4757"}}>*</span></div>
          <input value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))} placeholder="e.g. How to test a start relay in 10 seconds"
            style={{width:"100%",padding:"11px 12px",borderRadius:9,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
        </div>

        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,color:"#6b7db3",marginBottom:5}}>Category</div>
          <select value={form.category} onChange={e => setForm(f => ({...f,category:e.target.value}))}
            style={{width:"100%",padding:"11px 12px",borderRadius:9,border:"1px solid #2a3050",background:"#0f1117",color:form.category?"#fff":"#6b7db3",fontSize:13,outline:"none",boxSizing:"border-box"}}>
            <option value="">-- Select Category --</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,color:"#6b7db3",marginBottom:5}}>Description <span style={{color:"#ff4757"}}>*</span></div>
          <textarea value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))} placeholder="Write the full tip or trick here..." rows={4}
            style={{width:"100%",padding:"11px 12px",borderRadius:9,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}}/>
        </div>

        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:"#6b7db3",marginBottom:8}}>Media Reference</div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            {[{v:"none",l:"None"},{v:"image",l:"🔗 Image URL"},{v:"video_url",l:"▶️ Video URL"},{v:"upload",l:"📁 Upload"}].map(o => (
              <button key={o.v} onClick={() => setForm(f => ({...f,mediaType:o.v,mediaUrl:"",mediaData:""}))}
                style={{flex:1,padding:"8px 4px",borderRadius:8,border:form.mediaType===o.v?`2px solid ${ac}`:"1px solid #2a3050",background:form.mediaType===o.v?`${ac}22`:"#0f1117",color:form.mediaType===o.v?ac:"#6b7db3",fontSize:10,cursor:"pointer",fontWeight:600}}>
                {o.l}
              </button>
            ))}
          </div>

          {(form.mediaType==="image"||form.mediaType==="video_url") && (
            <input value={form.mediaUrl} onChange={e => setForm(f => ({...f,mediaUrl:e.target.value}))}
              placeholder={form.mediaType==="image"?"https://example.com/image.jpg":"https://youtube.com/watch?v=..."}
              style={{width:"100%",padding:"11px 12px",borderRadius:9,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
          )}

          {form.mediaType==="upload" && (
            <div>
              {preview ? (
                <div style={{position:"relative",marginBottom:8}}>
                  <img src={preview} alt="" style={{width:"100%",borderRadius:9,border:`1px solid ${ac}33`,maxHeight:180,objectFit:"contain",background:"#0a0d14"}}/>
                  <button onClick={() => {setPreview(null);setForm(f => ({...f,mediaData:""}));if(fileRef.current)fileRef.current.value="";}}
                    style={{position:"absolute",top:6,right:6,width:26,height:26,borderRadius:"50%",background:"#ff4757",border:"none",color:"#fff",fontSize:12,cursor:"pointer"}}>✕</button>
                </div>
              ) : (
                <div onClick={() => fileRef.current?.click()} style={{border:`2px dashed ${ac}44`,borderRadius:9,padding:18,textAlign:"center",cursor:"pointer",background:"#0a0d14"}}>
                  <div style={{fontSize:24,marginBottom:4}}>📁</div>
                  <div style={{fontSize:12,color:ac}}>{uploading?"Uploading...":"Tap to Upload Image"}</div>
                  <div style={{fontSize:10,color:"#6b7db3",marginTop:2}}>JPG, PNG — Max 5MB</div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{display:"none"}}/>
            </div>
          )}
        </div>

        <div style={{display:"flex",gap:8}}>
          <button onClick={save} style={{flex:1,padding:"12px",borderRadius:9,background:`linear-gradient(135deg,${ac},${pc})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:13}}>
            {editIdx!==null?"✅ Update Tip":"➕ Publish Tip"}
          </button>
          {editIdx!==null && <button onClick={() => {setForm({title:"",category:"",description:"",mediaType:"none",mediaUrl:"",mediaData:""});setPreview(null);setEditIdx(null);}} style={{padding:"12px 14px",borderRadius:9,background:"#2a3050",color:"#6b7db3",border:"none",cursor:"pointer"}}>Cancel</button>}
        </div>
      </div>

      <div style={{fontSize:12,fontWeight:600,color:"#6b7db3",marginBottom:10}}>{tips.length} tips published</div>
      {tips.map((tip,i) => (
        <div key={i} style={{background:"#1a1f2e",borderRadius:12,padding:12,marginBottom:8,border:"1px solid #2a3050",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1,marginRight:8}}>
            <div style={{fontSize:13,fontWeight:600,color:"#fff",marginBottom:2}}>{tip.title}</div>
            <div style={{fontSize:11,color:ac,marginBottom:4}}>{tip.category||"General"}</div>
            <div style={{fontSize:11,color:"#6b7db3",lineHeight:1.4}}>{tip.description?.slice(0,60)}{tip.description?.length>60?"...":""}</div>
            <div style={{fontSize:10,color:"#3a4060",marginTop:4}}>Media: {tip.mediaType==="none"?"None":tip.mediaType==="upload"?"Uploaded image":tip.mediaType}</div>
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button onClick={() => edit(i)} style={{background:`${ac}22`,border:"none",borderRadius:7,padding:"6px 9px",color:ac,cursor:"pointer",fontSize:11}}>✏️</button>
            <button onClick={() => del(i)} style={{background:"#ff475722",border:"none",borderRadius:7,padding:"6px 9px",color:"#ff4757",cursor:"pointer",fontSize:11}}>🗑️</button>
          </div>
        </div>
      ))}
      {tips.length===0 && <div style={{textAlign:"center",padding:20,color:"#6b7db3",fontSize:13}}>No tips yet. Publish your first tip above! 👆</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — COMMUNITY
// ═══════════════════════════════════════════════════════════════════════════════
function AdminCommunity({ pc, ac }) {
  const [settings, setSettingsLocal] = useState(() => DB.get("pcb_settings", DEFAULT_SETTINGS));
  const [posts, setPosts] = useState(() => DB.get("pcb_posts", DEMO_POSTS));
  const [newKw, setNewKw] = useState("");
  useEffect(() => DB.set("pcb_posts", posts), [posts]);
  const updateSettings = s => { setSettingsLocal(s); saveSettings(s); };
  const addKw = () => { if (!newKw.trim()) return; updateSettings({...settings,filterKeywords:[...(settings.filterKeywords||[]),newKw.trim()]}); setNewKw(""); };
  const delKw = kw => updateSettings({...settings,filterKeywords:(settings.filterKeywords||[]).filter(k => k!==kw)});
  return (
    <div>
      <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:4}}>🗣️ Community Moderation</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:16}}>Manage posts and filter keywords</div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14,border:"1px solid #ff475722",marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:600,color:"#ff4757",marginBottom:10}}>🚫 Filter Keywords</div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <input value={newKw} onChange={e => setNewKw(e.target.value)} onKeyDown={e => e.key==="Enter"&&addKw()} placeholder="Add blocked word..."
            style={{flex:1,padding:"10px 12px",borderRadius:9,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:12,outline:"none"}}/>
          <button onClick={addKw} style={{padding:"10px 14px",borderRadius:9,background:"#ff475722",color:"#ff4757",border:"1px solid #ff475744",cursor:"pointer",fontSize:12,fontWeight:600}}>+ Add</button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
          {(settings.filterKeywords||[]).map(kw => (
            <div key={kw} style={{display:"flex",alignItems:"center",gap:5,background:"#ff475711",borderRadius:6,padding:"5px 10px",border:"1px solid #ff475733"}}>
              <span style={{fontSize:11,color:"#ff4757"}}>{kw}</span>
              <button onClick={() => delKw(kw)} style={{background:"none",border:"none",color:"#ff4757",cursor:"pointer",fontSize:13,padding:0}}>×</button>
            </div>
          ))}
        </div>
        <div style={{fontSize:11,color:"#6b7db3"}}>📵 Phone numbers and URLs are always blocked automatically by the bot</div>
      </div>
      <div style={{fontSize:12,fontWeight:600,color:"#6b7db3",marginBottom:10}}>{posts.length} Community Posts</div>
      {posts.map(p => (
        <div key={p.id} style={{background:"#1a1f2e",borderRadius:12,padding:12,marginBottom:8,border:"1px solid #2a3050",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1,marginRight:8}}>
            <div style={{fontSize:12,fontWeight:600,color:"#fff",marginBottom:4}}>{p.author} · {p.time}</div>
            <div style={{fontSize:11,color:"#b0b8d0",lineHeight:1.5}}>{p.text.slice(0,80)}{p.text.length>80?"...":""}</div>
            <div style={{fontSize:10,color:"#6b7db3",marginTop:4}}>{p.replies.length} replies</div>
          </div>
          <button onClick={() => setPosts(prev => prev.filter(x => x.id!==p.id))} style={{background:"#ff475722",border:"none",borderRadius:7,padding:"6px 10px",color:"#ff4757",cursor:"pointer",fontSize:11,flexShrink:0}}>🗑️</button>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — AI SETUP
// ═══════════════════════════════════════════════════════════════════════════════
function AdminAI({ pc, ac }) {
  const [settings, setSettingsLocal] = useState(() => DB.get("pcb_settings", DEFAULT_SETTINGS));
  const [form, setForm] = useState({aiName:settings.aiName||"PCB AI",aiUrl:settings.aiUrl||"",aiToken:settings.aiToken||""});
  const [saved, setSaved] = useState(false);
  const save = () => { const s={...settings,...form}; setSettingsLocal(s); saveSettings(s); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div>
      <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:4}}>🤖 AI Assistant Setup</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:16}}>Connect Martial AI or use built-in assistant</div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14,border:"1px solid #4caf5033",marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:600,color:"#4caf50",marginBottom:6}}>✅ Built-in AI — Always Active</div>
        <div style={{fontSize:12,color:"#6b7db3",lineHeight:1.6}}>If URL and Token are left empty, the app uses built-in Claude AI. Fully functional for repair questions and community moderation bot.</div>
      </div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14,border:`1px solid ${pc}33`,marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:600,color:pc,marginBottom:12}}>🔌 Connect Martial AI or Any Custom AI</div>
        {[["aiName","Assistant Name (shown in app)","text"],["aiUrl","AI Endpoint URL","text"],["aiToken","API Token / Secret Key","password"]].map(([f,ph,t]) => (
          <div key={f} style={{marginBottom:10}}>
            <div style={{fontSize:11,color:"#6b7db3",marginBottom:5}}>{ph}</div>
            <input type={t} value={form[f]} onChange={e => setForm(x => ({...x,[f]:e.target.value}))} placeholder={ph}
              style={{width:"100%",padding:"11px 12px",borderRadius:9,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
          </div>
        ))}
        <button onClick={save} style={{width:"100%",padding:"12px",borderRadius:9,background:saved?"#4caf50":`linear-gradient(135deg,${pc},${ac})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:13}}>
          {saved?"✅ Saved!":"Save AI Settings"}
        </button>
      </div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14,border:`1px solid ${ac}22`}}>
        <div style={{fontSize:12,fontWeight:600,color:ac,marginBottom:10}}>📖 How to Connect Martial AI</div>
        {["1. Go to your Martial AI dashboard","2. Create a new API key and copy the token","3. Copy your endpoint URL","4. Paste both fields above and press Save","5. Your app will now use Martial AI for all responses"].map((s,i) => (
          <div key={i} style={{display:"flex",gap:8,marginBottom:7}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:`${ac}22`,color:ac,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700}}>{i+1}</div>
            <div style={{fontSize:12,color:"#b0b8d0"}}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — ADSENSE
// ═══════════════════════════════════════════════════════════════════════════════
function AdminAds({ pc, ac }) {
  const [settings, setSettingsLocal] = useState(() => DB.get("pcb_settings", DEFAULT_SETTINGS));
  const [form, setForm] = useState({adsenseId:settings.adsenseId||"",adsEnabled:settings.adsEnabled||false});
  const [saved, setSaved] = useState(false);
  const save = () => { const s={...settings,...form}; setSettingsLocal(s); saveSettings(s); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div>
      <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:4}}>💰 AdSense Integration</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:16}}>Monetize your app with Google AdSense</div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14,border:`1px solid ${ac}33`,marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:600,color:ac,marginBottom:10}}>📋 How to Connect AdSense</div>
        {["1. Sign up at adsense.google.com","2. Get your Publisher ID starting with ca-pub-...","3. Create ad units and note the slot IDs","4. Paste your Publisher ID below and enable","5. Ads will appear throughout your app automatically"].map((s,i) => (
          <div key={i} style={{display:"flex",gap:8,marginBottom:7}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:`${ac}22`,color:ac,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700}}>{i+1}</div>
            <div style={{fontSize:12,color:"#b0b8d0"}}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14,border:"1px solid #2a3050",marginBottom:14}}>
        <div style={{fontSize:11,color:"#6b7db3",marginBottom:6}}>AdSense Publisher ID</div>
        <input value={form.adsenseId} onChange={e => setForm(x => ({...x,adsenseId:e.target.value}))} placeholder="ca-pub-XXXXXXXXXXXXXXXXX"
          style={{width:"100%",padding:"11px 12px",borderRadius:9,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:14}}/>
        <div onClick={() => setForm(x => ({...x,adsEnabled:!x.adsEnabled}))}
          style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0f1117",borderRadius:9,padding:"12px 14px",border:"1px solid #2a3050",cursor:"pointer",marginBottom:14}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"#fff"}}>Enable Advertisements</div>
            <div style={{fontSize:11,color:"#6b7db3"}}>Show ads throughout the app</div>
          </div>
          <div style={{width:44,height:24,borderRadius:12,background:form.adsEnabled?pc:"#2a3050",position:"relative",transition:"background 0.2s"}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:form.adsEnabled?22:3,transition:"left 0.2s"}}/>
          </div>
        </div>
        <button onClick={save} style={{width:"100%",padding:"12px",borderRadius:9,background:saved?"#4caf50":`linear-gradient(135deg,${pc},${ac})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:13}}>
          {saved?"✅ Saved!":"Save AdSense Settings"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
function AdminSettings({ pc, ac }) {
  const [form, setForm] = useState(() => DB.get("pcb_settings", DEFAULT_SETTINGS));
  const [saved, setSaved] = useState(false);
  const save = () => { saveSettings(form); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const Toggle = ({field, label, desc, color}) => (
    <div onClick={() => setForm(f => ({...f,[field]:!f[field]}))}
      style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0f1117",borderRadius:9,padding:"12px 14px",border:"1px solid #2a3050",cursor:"pointer",marginBottom:10}}>
      <div>
        <div style={{fontSize:13,fontWeight:600,color:"#fff"}}>{label}</div>
        <div style={{fontSize:11,color:"#6b7db3",marginTop:2}}>{desc}</div>
      </div>
      <div style={{width:44,height:24,borderRadius:12,background:form[field]?(color||pc):"#2a3050",position:"relative",transition:"background 0.2s",flexShrink:0,marginLeft:10}}>
        <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:form[field]?22:3,transition:"left 0.2s"}}/>
      </div>
    </div>
  );
  return (
    <div>
      <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:4}}>⚙️ App Settings & Branding</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:16}}>Customize your app appearance and security</div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14,border:`1px solid ${pc}33`,marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:600,color:pc,marginBottom:12}}>🎨 Branding</div>
        {[["appName","App Name"],["tagline","Tagline / Subtitle"]].map(([f,l]) => (
          <div key={f} style={{marginBottom:10}}>
            <div style={{fontSize:11,color:"#6b7db3",marginBottom:5}}>{l}</div>
            <input value={form[f]||""} onChange={e => setForm(x => ({...x,[f]:e.target.value}))} placeholder={l}
              style={{width:"100%",padding:"11px 12px",borderRadius:9,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
          </div>
        ))}
        <div style={{display:"flex",gap:12}}>
          {[["primaryColor","Primary"],["accentColor","Accent"]].map(([f,l]) => (
            <div key={f} style={{flex:1}}>
              <div style={{fontSize:11,color:"#6b7db3",marginBottom:5}}>{l} Color</div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <input type="color" value={form[f]||"#4caf50"} onChange={e => setForm(x => ({...x,[f]:e.target.value}))} style={{width:38,height:34,borderRadius:7,border:"1px solid #2a3050",background:"none",cursor:"pointer",padding:2}}/>
                <input value={form[f]||""} onChange={e => setForm(x => ({...x,[f]:e.target.value}))} style={{flex:1,padding:"8px 10px",borderRadius:7,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:11,outline:"none"}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14,border:"1px solid #ff475733",marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:600,color:"#ff4757",marginBottom:10}}>🔐 Admin Password</div>
        <input type="password" value={form.adminPassword||""} onChange={e => setForm(x => ({...x,adminPassword:e.target.value}))} placeholder="New admin password"
          style={{width:"100%",padding:"11px 12px",borderRadius:9,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
        <div style={{fontSize:10,color:"#6b7db3",marginTop:6}}>⚠️ Remember your new password before saving</div>
      </div>
      {/* Feature Toggles */}
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14,border:"1px solid #2a3050",marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:600,color:pc,marginBottom:12}}>🎛️ Feature Controls</div>
        <Toggle field="partsEnabled" label="🔩 Part Finder" desc="Enable or disable the Parts Finder for all users" color={pc}/>
        <Toggle field="notificationsEnabled" label="🔔 Push Notifications" desc="Allow the app to send notifications to users" color="#ffa502"/>
        <Toggle field="adsEnabled" label="💰 Advertisements" desc="Show AdSense ads throughout the app" color="#ffd700"/>
      </div>

      <button onClick={save} style={{width:"100%",padding:"13px",borderRadius:10,background:saved?"#4caf50":`linear-gradient(135deg,${form.primaryColor||pc},${form.accentColor||ac})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:14}}>
        {saved?"✅ All Settings Saved!":"Save All Settings"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PANEL WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════
function AdminPanel({ onClose }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState("insights");
  const settings = DB.get("pcb_settings", DEFAULT_SETTINGS);
  const pc = settings.primaryColor || "#4caf50";
  const ac = settings.accentColor || "#ffd700";
  const online = useOnline();

  const login = () => { if (pw === settings.adminPassword) { setAuthed(true); setErr(false); } else setErr(true); };

  const tabs = [
    {id:"insights",icon:"📊",label:"Insights"},
    {id:"users",icon:"👥",label:"Users"},
    {id:"brands",icon:"🏷️",label:"Brands"},
    {id:"errors",icon:"🔴",label:"Errors"},
    {id:"wiring",icon:"⚡",label:"Wiring"},
    {id:"tips",icon:"💡",label:"Tips"},
    {id:"community",icon:"🗣️",label:"Community"},
    {id:"ai",icon:"🤖",label:"AI Setup"},
    {id:"ads",icon:"💰",label:"AdSense"},
    {id:"settings",icon:"⚙️",label:"Settings"},
  ];

  if (!authed) return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"#0a0d14",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#1a1f2e",borderRadius:20,padding:32,width:"100%",maxWidth:360,border:"1px solid #2a3050",textAlign:"center"}}>
        <img src={LOGO} alt="PCB Care" style={{width:150,marginBottom:20}}/>
        <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>Admin Panel</div>
        <div style={{fontSize:12,color:"#6b7db3",marginBottom:20}}>Authorized admin access only</div>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key==="Enter"&&login()} placeholder="Enter Admin Password"
          style={{width:"100%",padding:"13px 14px",borderRadius:10,border:`1px solid ${err?"#ff4757":"#2a3050"}`,background:"#0f1117",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
        {err && <div style={{color:"#ff4757",fontSize:12,marginBottom:10}}>❌ Incorrect password. Try again.</div>}
        <button onClick={login} style={{width:"100%",padding:"13px",borderRadius:10,background:`linear-gradient(135deg,${pc},${ac})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:14,marginBottom:10}}>Login to Admin</button>
        <button onClick={onClose} style={{width:"100%",padding:"11px",borderRadius:10,background:"none",border:"1px solid #2a3050",color:"#6b7db3",cursor:"pointer",fontSize:13}}>← Back to App</button>
        
      </div>
    </div>
  );

  return (
    <div style={{fontFamily:"'Inter','Segoe UI',sans-serif",background:"#0a0d14",minHeight:"100vh",color:"#e8eaf0",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:"#1a1f2e",borderBottom:"1px solid #2a3050",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src={LOGO} alt="" style={{height:32}}/>
          <div>
            <div style={{fontWeight:700,fontSize:15,color:"#fff"}}>⚙️ Admin Panel</div>
            <div style={{fontSize:10,color:"#6b7db3"}}>PCB Care Management</div>
          </div>
        </div>
        <button onClick={onClose} style={{background:"#2a3050",border:"none",borderRadius:8,padding:"6px 12px",color:"#6b7db3",fontSize:12,cursor:"pointer",fontWeight:600}}>✕ Close</button>
      </div>
      <div style={{overflowX:"auto",display:"flex",gap:4,padding:"8px 12px",borderBottom:"1px solid #2a3050",background:"#1a1f2e"}}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{whiteSpace:"nowrap",padding:"7px 10px",borderRadius:8,border:tab===t.id?`1px solid ${pc}`:"1px solid transparent",background:tab===t.id?`${pc}22`:"none",color:tab===t.id?pc:"#6b7db3",fontSize:11,cursor:"pointer",fontWeight:600}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div style={{padding:16,paddingBottom:40}}>
        {tab==="insights" && <AdminInsights pc={pc} ac={ac} online={online}/>}
        {tab==="users" && <AdminUsers pc={pc} ac={ac}/>}
        {tab==="brands" && <AdminBrands pc={pc} ac={ac}/>}
        {tab==="errors" && <AdminErrors pc={pc} ac={ac}/>}
        {tab==="wiring" && <AdminWiring pc={pc} ac={ac}/>}
        {tab==="tips" && <AdminTips pc={pc} ac={ac}/>}
        {tab==="community" && <AdminCommunity pc={pc} ac={ac}/>}
        {tab==="ai" && <AdminAI pc={pc} ac={ac}/>}
        {tab==="ads" && <AdminAds pc={pc} ac={ac}/>}
        {tab==="settings" && <AdminSettings pc={pc} ac={ac}/>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function PCBCare() {
  const [intro, setIntro] = useState(true);
  const [user, setUser] = useState(null);
  const [section, setSection] = useState("home");
  const [adminOpen, setAdminOpen] = useState(false);
  const [notifAsked, setNotifAsked] = useState(() => DB.get("pcb_notif_asked", false));
  const [notifPrompt, setNotifPrompt] = useState(false);
  const s = useSettings();
  const pc = s.primaryColor || "#4caf50";
  const ac = s.accentColor || "#ffd700";

  // Screen & screenshot protection
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "pcb-protect";
    style.innerHTML = "* { -webkit-user-select: none !important; user-select: none !important; } body { -webkit-touch-callout: none !important; }";
    document.head.appendChild(style);
    const handleKey = (e) => {
      if (e.key === "PrintScreen" || (e.ctrlKey && e.shiftKey && (e.key==="S"||e.key==="s"))) e.preventDefault();
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); document.getElementById("pcb-protect")?.remove(); };
  }, []);

  // Notification prompt after login
  useEffect(() => {
    if (user && !notifAsked && s.notificationsEnabled !== false) {
      setTimeout(() => setNotifPrompt(true), 1500);
    }
  }, [user, notifAsked, s.notificationsEnabled]);

  const handleNotifAllow = async () => {
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          new Notification("PCB Care", { body: "Notifications enabled! You will be notified of new content.", icon: "/logo.png" });
        }
      }
    } catch(e) {}
    DB.set("pcb_notif_asked", true);
    setNotifAsked(true);
    setNotifPrompt(false);
  };

  const handleNotifDeny = () => {
    DB.set("pcb_notif_asked", true);
    setNotifAsked(true);
    setNotifPrompt(false);
  };

  const partsEnabled = s.partsEnabled !== false;

  const nav = [
    {id:"home",icon:"🏠",label:"Home"},
    {id:"errors",icon:"🔴",label:"Errors"},
    {id:"wiring",icon:"⚡",label:"Wiring"},
    ...(partsEnabled ? [{id:"parts",icon:"🔩",label:"Parts"}] : []),
    {id:"tips",icon:"💡",label:"Tips"},
    {id:"community",icon:"👥",label:"Community"},
    {id:"ai",icon:"🤖",label:s.aiName||"AI"},
  ];

  if (intro) return <Intro onDone={() => setIntro(false)}/>;
  if (!user) return <Auth onLogin={u => setUser(u)}/>;
  if (adminOpen) return <AdminPanel onClose={() => setAdminOpen(false)}/>;

  return (
    <div style={{fontFamily:"'Inter','Segoe UI',sans-serif",background:"#0a0d14",minHeight:"100vh",color:"#e8eaf0",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:"#1a1f2e",borderBottom:"1px solid #2a3050",padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <img src={LOGO} alt="PCB Care" style={{height:38}}/>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontSize:10,color:"#4caf50",background:"#4caf5011",borderRadius:20,padding:"4px 10px",border:"1px solid #4caf5033"}}>🟢 Online</div>
          <button onClick={() => setAdminOpen(true)} style={{background:"#2a3050",border:"none",borderRadius:8,padding:"6px 10px",color:"#6b7db3",fontSize:11,cursor:"pointer",fontWeight:600}}>⚙️ Admin</button>
        </div>
      </div>
      {/* Notification Prompt */}
      {notifPrompt && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:9998,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:20}}>
          <div style={{background:"#1a1f2e",borderRadius:20,padding:24,width:"100%",maxWidth:420,border:"1px solid #2a3050",marginBottom:10}}>
            <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:16}}>
              <div style={{fontSize:36}}>🔔</div>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:6}}>Enable Notifications</div>
                <div style={{fontSize:13,color:"#b0b8d0",lineHeight:1.6}}>Get notified when new wiring diagrams, error codes, tips, or updates are published by admin.</div>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={handleNotifAllow} style={{flex:1,padding:"13px",borderRadius:12,background:`linear-gradient(135deg,${pc},${ac})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:14}}>
                🔔 Allow
              </button>
              <button onClick={handleNotifDeny} style={{flex:1,padding:"13px",borderRadius:12,background:"#2a3050",color:"#6b7db3",border:"none",cursor:"pointer",fontWeight:600,fontSize:14}}>
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{paddingBottom:80}}>
        {section==="home" && <Home setSection={setSection}/>}
        {section==="errors" && <Errors/>}
        {section==="wiring" && <Wiring/>}
        {partsEnabled && section==="parts" && <Parts/>}
        {section==="tips" && <TipsTricks/>}
        {section==="community" && <Community/>}
        {section==="ai" && <AIChat/>}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#1a1f2e",borderTop:"1px solid #2a3050",display:"flex",padding:"6px 0 10px"}}>
        {nav.map(n => (
          <button key={n.id} onClick={() => setSection(n.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"5px 0"}}>
            <div style={{fontSize:18}}>{n.icon}</div>
            <div style={{fontSize:8,fontWeight:600,color:section===n.id?pc:"#6b7db3",textTransform:"uppercase",letterSpacing:"0.3px"}}>{n.label}</div>
            {section===n.id && <div style={{width:16,height:2,background:pc,borderRadius:2}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}