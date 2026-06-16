import React, { useState, useEffect, useRef } from "react";

const LOGO = "data:image/jpeg;base64,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";
const INTRO_VIDEO = ""; // paste base64 data URL or http(s) video URL for intro; empty = animated logo intro
const APP_URL = "https://pcbcare.vercel.app";
const SB_URL = "https://vdyyaiapyhwqnxzeujim.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeXlhaWFweWh3cW54emV1amltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTI4MjAsImV4cCI6MjA5NzAyODgyMH0.YFoYsPEkkYCt84FfNF_4U189fhNjTT-1rq1BEst3njo";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAn1mLFmN-0eOkgzVj_eZ1-Nr4AVX8IAOg",
  authDomain: "pcb-care.firebaseapp.com",
  projectId: "pcb-care",
  storageBucket: "pcb-care.firebasestorage.app",
  messagingSenderId: "849256587515",
  appId: "1:849256587515:web:3577e0896e6642000f905e",
  measurementId: "G-7LJ17PXJ8C"
};
const FB_KEY = FIREBASE_CONFIG.apiKey;

const PC = "#4caf50";
const AC = "#ffd700";

// Admin direct-login credentials
const ADMIN_EMAIL = "nnikhilpanjwani17@gmail.com";
const ADMIN_PASSWORD = "6thdecember2023";

const DB = {
  get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
};

const api = async (table,{method="GET",filter="",body=null,prefer=""}={}) => {
  const url = `${SB_URL}/rest/v1/${table}${filter}`;
  const h = {apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,"Content-Type":"application/json"};
  if(prefer) h["Prefer"]=prefer;
  const r = await fetch(url,{method,headers:h,body:body?JSON.stringify(body):null});
  if(method==="DELETE"||method==="PATCH") return r;
  return r.json();
};

// ── Firebase SDK loader + Google Sign-In ───────────────────────────────────────
let _fbApp=null,_fbAuth=null,_fbReady=null;
const loadScript=src=>new Promise((res,rej)=>{
  if([...document.scripts].some(s=>s.src===src))return res();
  const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);
});
const initFirebase=async()=>{
  if(_fbReady)return _fbReady;
  _fbReady=(async()=>{
    await loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
    await loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js");
    if(!window.firebase.apps.length)_fbApp=window.firebase.initializeApp(FIREBASE_CONFIG);
    else _fbApp=window.firebase.app();
    _fbAuth=window.firebase.auth();
    return _fbAuth;
  })();
  return _fbReady;
};
const googleSignIn=async()=>{
  const auth=await initFirebase();
  const provider=new window.firebase.auth.GoogleAuthProvider();
  const result=await auth.signInWithPopup(provider);
  return result.user;
};

// ── App settings (single-row config, id=1) ─────────────────────────────────────
const getAutoApprove=async()=>{
  try{
    const d=await api("app_settings",{filter:"?id=eq.1&select=auto_approve"});
    if(Array.isArray(d)&&d.length)return !!d[0].auto_approve;
  }catch{}
  return false;
};
const setAutoApprove=async(val)=>{
  await fetch(`${SB_URL}/rest/v1/app_settings?id=eq.1`,{method:"PATCH",headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({auto_approve:val})});
};

// AdSense full-screen ad gate
function AdGate({onComplete}) {
  const [secs, setSecs] = useState(15);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => {
      if(s<=1){clearInterval(t);setDone(true);return 0;}
      return s-1;
    }),1000);
    return ()=>clearInterval(t);
  },[]);
  return (
    <div style={{position:"fixed",inset:0,background:"#000",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <div style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"6px 14px",fontSize:12,color:"#fff"}}>
        {done?"":"Ad ends in "+secs+"s"}
      </div>
      <div style={{width:"100%",maxWidth:480,padding:20,textAlign:"center"}}>
        <div style={{fontSize:13,color:"#888",marginBottom:14,textTransform:"uppercase",letterSpacing:2}}>Advertisement</div>
        <div style={{background:"#1a1a1a",borderRadius:16,aspectRatio:"16/9",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,border:"1px solid #333",overflow:"hidden"}}>
          <ins className="adsbygoogle"
            style={{display:"block",width:"100%",height:"100%"}}
            data-ad-client="ca-pub-3960694190417659"
            data-ad-slot="auto"
            data-ad-format="auto"
            data-full-width-responsive="true"/>
        </div>
        <div style={{height:4,background:"#222",borderRadius:4,overflow:"hidden",marginBottom:16}}>
          <div style={{height:"100%",background:`linear-gradient(90deg,${PC},${AC})`,borderRadius:4,transition:"width 1s linear",width:`${((15-secs)/15)*100}%`}}/>
        </div>
        <div style={{fontSize:12,color:"#555"}}>Please wait for the advertisement to finish</div>
      </div>
      {done && <button onClick={onComplete} style={{position:"absolute",bottom:40,padding:"14px 48px",borderRadius:14,background:`linear-gradient(135deg,${PC},${AC})`,color:"#000",border:"none",cursor:"pointer",fontWeight:700,fontSize:15}}>Continue →</button>}
    </div>
  );
}

// Intro animation (supports video via INTRO_VIDEO, else animated logo)
function Intro({onDone}) {
  const [p,setP]=useState(0);
  useEffect(()=>{
    if(INTRO_VIDEO)return; // video handles its own timing via onEnded
    const t1=setTimeout(()=>setP(1),400);
    const t2=setTimeout(()=>setP(2),1400);
    const t3=setTimeout(()=>onDone(),3200);
    return()=>[t1,t2,t3].forEach(clearTimeout);
  },[onDone]);

  if(INTRO_VIDEO){
    return (
      <div style={{position:"fixed",inset:0,background:"#0a0d14",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}}>
        <video src={INTRO_VIDEO} autoPlay muted playsInline onEnded={onDone}
          onError={onDone}
          style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <button onClick={onDone} style={{position:"absolute",bottom:30,right:20,background:"rgba(255,255,255,0.15)",border:"none",borderRadius:20,padding:"8px 16px",color:"#fff",fontSize:12,cursor:"pointer"}}>Skip →</button>
      </div>
    );
  }

  return (
    <div style={{position:"fixed",inset:0,background:"#0a0d14",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:9999}}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.08}} viewBox="0 0 400 800">
        <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4caf50"/><stop offset="100%" stopColor="#ffd700"/></linearGradient></defs>
        {[...Array(8)].map((_,i)=><line key={i} x1={i*55} y1="0" x2={i*55} y2="800" stroke="url(#g1)" strokeWidth="1"/>)}
        {[...Array(15)].map((_,i)=><line key={i} x1="0" y1={i*56} x2="400" y2={i*56} stroke="url(#g1)" strokeWidth="1"/>)}
        {[...Array(5)].map((_,i)=><circle key={i} cx={60+i*70} cy={120+i*100} r="4" fill="#4caf50" opacity="0.5"/>)}
      </svg>
      <div style={{transition:"all 0.9s cubic-bezier(0.34,1.56,0.64,1)",transform:p>=1?"scale(1) translateY(0)":"scale(0.2) translateY(60px)",opacity:p>=1?1:0,filter:"drop-shadow(0 0 40px rgba(76,175,80,0.7))"}}>
        <img src={LOGO} alt="PCB Care" style={{width:240,height:"auto"}}/>
      </div>
      <div style={{position:"absolute",bottom:70,width:200,height:3,background:"#1a1f2e",borderRadius:4,overflow:"hidden"}}>
        <div style={{height:"100%",background:`linear-gradient(90deg,${PC},${AC})`,borderRadius:4,transition:"width 2.8s ease",width:p>=1?"100%":"0%"}}/>
      </div>
      <div style={{position:"absolute",bottom:46,fontSize:11,color:"#3a4060",letterSpacing:3}}>LOADING...</div>
    </div>
  );
}

// Login page (handles admin direct-login + real Google sign-in)
function Login({onLogin, onGoSignup, onAdmin}) {
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [gLoading,setGLoading]=useState(false);

  const finishLogin=async(uid)=>{
    const users = await api("users",{filter:`?firebase_uid=eq.${uid}&select=*`});
    const user = Array.isArray(users)?users[0]:null;
    if(!user){setErr("Account not found. Please sign up.");return null;}
    if(user.status==="pending"){setErr("Account pending admin approval.");return null;}
    if(user.status==="rejected"){setErr("Account rejected. Contact admin.");return null;}
    DB.set("pcb_user",user);onLogin(user);return user;
  };

  const doLogin = async () => {
    if(!email||!pw){setErr("Enter email and password");return;}
    // Admin direct login
    if(email.trim().toLowerCase()===ADMIN_EMAIL && pw===ADMIN_PASSWORD){onAdmin();return;}
    setLoading(true);setErr("");
    try {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FB_KEY}`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password:pw,returnSecureToken:true})
      });
      const data = await res.json();
      if(data.error){setErr(data.error.message.replace(/_/g," "));setLoading(false);return;}
      await finishLogin(data.localId);
    } catch{setErr("Connection error. Try again.");}
    setLoading(false);
  };

  const doGoogle = async () => {
    setGLoading(true);setErr("");
    try{
      const gUser=await googleSignIn();
      const users=await api("users",{filter:`?firebase_uid=eq.${gUser.uid}&select=*`});
      const existing=Array.isArray(users)?users[0]:null;
      if(existing){
        if(existing.status==="pending"){setErr("Account pending admin approval.");setGLoading(false);return;}
        if(existing.status==="rejected"){setErr("Account rejected. Contact admin.");setGLoading(false);return;}
        DB.set("pcb_user",existing);onLogin(existing);
      }else{
        // Auto-register google user respecting approval toggle
        const auto=await getAutoApprove();
        await api("users",{method:"POST",body:{firebase_uid:gUser.uid,full_name:gUser.displayName||"Technician",email:gUser.email||"",phone:gUser.phoneNumber||"",country:"Pakistan",state:"",city:"",instagram_id:"",experience:"",specialization:"",method:"Google",status:auto?"approved":"pending"},prefer:"return=representation"});
        if(auto){
          const fresh=await api("users",{filter:`?firebase_uid=eq.${gUser.uid}&select=*`});
          const u=Array.isArray(fresh)?fresh[0]:null;
          if(u){DB.set("pcb_user",u);onLogin(u);}
        }else{
          setErr("Registered! Your account is pending admin approval.");
        }
      }
    }catch(e){setErr("Google Sign-In failed. "+(e?.message||""));}
    setGLoading(false);
  };

  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"#0a0d14",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#1a1f2e",borderRadius:20,padding:32,maxWidth:380,width:"100%",border:"1px solid #2a3050"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <img src={LOGO} alt="PCB Care" style={{width:180,marginBottom:14,filter:"drop-shadow(0 0 20px rgba(76,175,80,0.3))"}}/>
          <div style={{fontSize:13,color:"#6b7db3"}}>Sign in to your account</div>
        </div>
        <button onClick={doGoogle} disabled={gLoading}
          style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"13px",borderRadius:12,border:"1px solid #dadce0",background:"#fff",color:"#3c4043",cursor:"pointer",fontWeight:600,fontSize:14,marginBottom:18}}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {gLoading?"Connecting...":"Continue with Google"}
        </button>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <div style={{flex:1,height:1,background:"#2a3050"}}/><div style={{fontSize:12,color:"#6b7db3"}}>or</div><div style={{flex:1,height:1,background:"#2a3050"}}/>
        </div>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address"
          style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} placeholder="Password"
          style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
        {err && <div style={{color:"#ff4757",fontSize:12,marginBottom:10,padding:"8px 12px",background:"#ff475711",borderRadius:8}}>⚠ {err}</div>}
        <button onClick={doLogin} disabled={loading}
          style={{width:"100%",padding:"13px",borderRadius:10,background:`linear-gradient(135deg,${PC},${AC})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:14,marginBottom:14}}>
          {loading?"Signing in...":"Sign In"}
        </button>
        <div style={{textAlign:"center",fontSize:13,color:"#6b7db3"}}>
          Don't have an account?{" "}
          <button onClick={onGoSignup} style={{background:"none",border:"none",color:PC,cursor:"pointer",fontSize:13,fontWeight:600,textDecoration:"underline"}}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}

// Signup page
function Signup({onGoLogin, onLogin}) {
  const [step,setStep]=useState(1);
  const [method,setMethod]=useState("email");
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [phone,setPhone]=useState("");
  const [otp,setOtp]=useState("");
  const [otpSent,setOtpSent]=useState(false);
  const [form,setForm]=useState({fullName:"",state:"",city:"",instagramId:"",experience:"",specialization:""});
  const [errors,setErrors]=useState({});
  const [loading,setLoading]=useState(false);
  const [gLoading,setGLoading]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const [err,setErr]=useState("");
  const EXP=["< 1 year","1-3 years","3-5 years","5-10 years","10+ years"];
  const SPEC=["Refrigerator","Washing Machine","Air Conditioner","All Appliances","Other Electronics"];
  const validate=()=>{
    const e={};
    if(!form.fullName.trim())e.fullName="Required";
    if(!form.city.trim())e.city="Required";
    if(!form.experience)e.experience="Required";
    if(!form.specialization)e.specialization="Required";
    setErrors(e);return Object.keys(e).length===0;
  };
  const register=async(uid,emailVal,phoneVal,meth)=>{
    const auto=await getAutoApprove();
    const status=auto?"approved":"pending";
    await api("users",{method:"POST",body:{firebase_uid:uid,full_name:form.fullName,email:emailVal||"",phone:phoneVal||"",country:"Pakistan",state:form.state,city:form.city,instagram_id:form.instagramId,experience:form.experience,specialization:form.specialization,method:meth,status},prefer:"return=minimal"});
    if(auto && onLogin){
      const fresh=await api("users",{filter:`?firebase_uid=eq.${uid}&select=*`});
      const u=Array.isArray(fresh)?fresh[0]:null;
      if(u){DB.set("pcb_user",u);onLogin(u);return;}
    }
    setSubmitted(true);
  };
  const doSignup=async()=>{
    if(!validate())return;
    setLoading(true);setErr("");
    try{
      if(method==="email"){
        if(!email||!pw){setErr("Enter email and password");setLoading(false);return;}
        const res=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FB_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password:pw,returnSecureToken:true})});
        const data=await res.json();
        if(data.error){setErr(data.error.message.replace(/_/g," "));setLoading(false);return;}
        await register(data.localId,email,"","Email");
      } else {
        await register("phone_"+Date.now(),"",phone,"Phone");
      }
    }catch{setErr("Connection error.");}
    setLoading(false);
  };
  const doGoogleSignup=async()=>{
    setGLoading(true);setErr("");
    try{
      const gUser=await googleSignIn();
      const users=await api("users",{filter:`?firebase_uid=eq.${gUser.uid}&select=*`});
      const existing=Array.isArray(users)?users[0]:null;
      if(existing){
        if(existing.status==="approved"){DB.set("pcb_user",existing);onLogin&&onLogin(existing);}
        else setErr("Account already exists and is pending approval.");
        setGLoading(false);return;
      }
      const auto=await getAutoApprove();
      await api("users",{method:"POST",body:{firebase_uid:gUser.uid,full_name:gUser.displayName||form.fullName||"Technician",email:gUser.email||"",phone:gUser.phoneNumber||"",country:"Pakistan",state:form.state,city:form.city,instagram_id:form.instagramId,experience:form.experience,specialization:form.specialization,method:"Google",status:auto?"approved":"pending"},prefer:"return=minimal"});
      if(auto){
        const fresh=await api("users",{filter:`?firebase_uid=eq.${gUser.uid}&select=*`});
        const u=Array.isArray(fresh)?fresh[0]:null;
        if(u){DB.set("pcb_user",u);onLogin&&onLogin(u);}
      }else setSubmitted(true);
    }catch(e){setErr("Google Sign-In failed. "+(e?.message||""));}
    setGLoading(false);
  };
  if(submitted) return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"#0a0d14",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#1a1f2e",borderRadius:20,padding:32,maxWidth:360,width:"100%",textAlign:"center",border:"1px solid #2a3050"}}>
        <img src={LOGO} alt="" style={{width:150,marginBottom:20}}/>
        <div style={{fontSize:40,marginBottom:14}}>⏳</div>
        <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:8}}>Registration Submitted!</div>
        <div style={{fontSize:13,color:"#6b7db3",lineHeight:1.7,marginBottom:20}}>Your account is pending admin approval. You will be notified once approved within 24-48 hours.</div>
        <button onClick={onGoLogin} style={{background:"none",border:"1px solid #2a3050",borderRadius:10,padding:"10px 20px",color:"#6b7db3",cursor:"pointer",fontSize:13}}>← Back to Login</button>
      </div>
    </div>
  );
  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"#0a0d14",minHeight:"100vh",overflowY:"auto",padding:20}}>
      <div style={{maxWidth:420,margin:"0 auto"}}>
        <div style={{textAlign:"center",padding:"20px 0 16px"}}>
          <img src={LOGO} alt="" style={{width:140,marginBottom:12}}/>
          <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>Create Account</div>
          <div style={{fontSize:12,color:"#6b7db3"}}>Step {step} of 2</div>
          <div style={{display:"flex",gap:4,justifyContent:"center",marginTop:8}}>
            {[1,2].map(s=><div key={s} style={{width:40,height:3,borderRadius:4,background:step>=s?PC:"#2a3050"}}/>)}
          </div>
        </div>
        {step===1 && (
          <div style={{background:"#1a1f2e",borderRadius:16,padding:20,border:"1px solid #2a3050",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:600,color:"#fff",marginBottom:14}}>Choose Sign Up Method</div>
            <button onClick={doGoogleSignup} disabled={gLoading}
              style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"13px",borderRadius:12,border:"1px solid #dadce0",background:"#fff",color:"#3c4043",cursor:"pointer",fontWeight:600,fontSize:14,marginBottom:12}}>
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              {gLoading?"Connecting...":"Sign up with Google"}
            </button>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{flex:1,height:1,background:"#2a3050"}}/><div style={{fontSize:12,color:"#6b7db3"}}>or with email</div><div style={{flex:1,height:1,background:"#2a3050"}}/>
            </div>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address"
              style={{width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${method==="email"?"#2a3050":"#1a1f2e"}`,background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}
              onFocus={()=>setMethod("email")}/>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password (min 6 chars)"
              style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:10}}
              onFocus={()=>setMethod("email")}/>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{flex:1,height:1,background:"#2a3050"}}/><div style={{fontSize:12,color:"#6b7db3"}}>or phone</div><div style={{flex:1,height:1,background:"#2a3050"}}/>
            </div>
            <input value={phone} onChange={e=>{setPhone(e.target.value);setMethod("phone");}} placeholder="Phone +92-300-0000000"
              style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
            {phone && !otpSent && <button onClick={()=>setOtpSent(true)} style={{width:"100%",padding:"11px",borderRadius:10,background:"#2a3050",color:"#fff",border:"none",cursor:"pointer",fontSize:13,marginBottom:8}}>📱 Send OTP</button>}
            {otpSent && <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Enter OTP"
              style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>}
            {err && <div style={{color:"#ff4757",fontSize:12,padding:"8px 12px",background:"#ff475711",borderRadius:8,marginBottom:8}}>⚠ {err}</div>}
            <button onClick={()=>setStep(2)} style={{width:"100%",padding:"13px",borderRadius:10,background:`linear-gradient(135deg,${PC},${AC})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:14,marginTop:4}}>Next →</button>
          </div>
        )}
        {step===2 && (
          <div style={{background:"#1a1f2e",borderRadius:16,padding:20,border:"1px solid #2a3050",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:600,color:"#fff",marginBottom:14}}>Your Details</div>
            {[["fullName","👤 Full Name","Your full name",true],["city","🏙️ City","e.g. Karachi, Lahore",true],["state","🗺️ State","e.g. Punjab, Sindh",false],["instagramId","📸 Instagram Username","@yourusername (optional)",false]].map(([f,label,ph,req])=>(
              <div key={f} style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:600,color:"#e8eaf0",marginBottom:5}}>{label} {req&&<span style={{color:"#ff4757"}}>*</span>}</div>
                <input value={form[f]} onChange={e=>setForm(x=>({...x,[f]:e.target.value}))} placeholder={ph}
                  style={{width:"100%",padding:"11px 14px",borderRadius:10,border:`1px solid ${errors[f]?"#ff4757":"#2a3050"}`,background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                {errors[f]&&<div style={{color:"#ff4757",fontSize:11,marginTop:3}}>⚠ {errors[f]}</div>}
              </div>
            ))}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:600,color:"#e8eaf0",marginBottom:8}}>🔧 Experience <span style={{color:"#ff4757"}}>*</span></div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {EXP.map(e=><button key={e} onClick={()=>setForm(x=>({...x,experience:e}))}
                  style={{padding:"7px 12px",borderRadius:20,border:form.experience===e?`2px solid ${PC}`:"1px solid #2a3050",background:form.experience===e?`${PC}22`:"#0f1117",color:form.experience===e?PC:"#6b7db3",fontSize:11,cursor:"pointer"}}>{e}</button>)}
              </div>
              {errors.experience&&<div style={{color:"#ff4757",fontSize:11,marginTop:4}}>⚠ {errors.experience}</div>}
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:600,color:"#e8eaf0",marginBottom:8}}>⚙️ Specialization <span style={{color:"#ff4757"}}>*</span></div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {SPEC.map(s=><button key={s} onClick={()=>setForm(x=>({...x,specialization:s}))}
                  style={{padding:"7px 12px",borderRadius:20,border:form.specialization===s?`2px solid ${AC}`:"1px solid #2a3050",background:form.specialization===s?`${AC}22`:"#0f1117",color:form.specialization===s?AC:"#6b7db3",fontSize:11,cursor:"pointer"}}>{s}</button>)}
              </div>
              {errors.specialization&&<div style={{color:"#ff4757",fontSize:11,marginTop:4}}>⚠ {errors.specialization}</div>}
            </div>
            {err&&<div style={{color:"#ff4757",fontSize:12,padding:"8px 12px",background:"#ff475711",borderRadius:8,marginBottom:10}}>⚠ {err}</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setStep(1)} style={{flex:1,padding:"12px",borderRadius:10,background:"#2a3050",color:"#6b7db3",border:"none",cursor:"pointer",fontSize:13}}>← Back</button>
              <button onClick={doSignup} disabled={loading} style={{flex:2,padding:"12px",borderRadius:10,background:`linear-gradient(135deg,${PC},${AC})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:14}}>
                {loading?"Submitting...":"Submit Registration"}
              </button>
            </div>
          </div>
        )}
        <div style={{textAlign:"center",fontSize:13,color:"#6b7db3",marginBottom:24}}>
          Already have an account?{" "}
          <button onClick={onGoLogin} style={{background:"none",border:"none",color:PC,cursor:"pointer",fontSize:13,fontWeight:600,textDecoration:"underline"}}>Sign In</button>
        </div>
      </div>
    </div>
  );
}

const moderate=(text)=>{
  if(/(\+?[\d\s\-.()]{10,})/.test(text))return{blocked:true,reason:"Phone numbers are not allowed."};
  if(/(https?:\/\/[^\s]+|www\.[^\s]+)/i.test(text))return{blocked:true,reason:"URLs are not allowed."};
  const bad=["fuck","shit","bitch","asshole","bastard","whore","idiot"];
  if(bad.some(w=>text.toLowerCase().includes(w)))return{blocked:true,reason:"Prohibited language detected."};
  return{blocked:false};
};

// Home
function Home({setAdGate}) {
  const cards=[
    {id:"errors",icon:"🔴",title:"Error Codes",desc:"Fault codes by brand",color:"#ff4757"},
    {id:"wiring",icon:"⚡",title:"Wiring Diagrams",desc:"Circuit diagrams & images",color:AC},
    {id:"tips",icon:"💡",title:"Tips & Tricks",desc:"Expert repair tips",color:"#ffd700"},
    {id:"sensors",icon:"📡",title:"Sensor Values",desc:"Component test values",color:"#00bcd4"},
    {id:"community",icon:"👥",title:"Community",desc:"Ask & share",color:"#7c5cfc"},
    {id:"ai",icon:"🤖",title:"PCB AI",desc:"AI repair assistant",color:"#4caf50"},
    {id:"requests",icon:"📥",title:"Requests",desc:"Request new content",color:"#ff6b35"},
  ];
  return (
    <div style={{padding:16}}>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:20,fontWeight:700,color:"#fff",marginBottom:4}}>Welcome, Technician 👋</div>
        <div style={{fontSize:12,color:"#6b7db3"}}>Tap any feature to get started</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        {cards.map(c=>(
          <div key={c.id} onClick={()=>setAdGate(c.id)} style={{background:"#1a1f2e",border:`1px solid ${c.color}22`,borderRadius:14,padding:16,cursor:"pointer"}}>
            <div style={{fontSize:26,marginBottom:8}}>{c.icon}</div>
            <div style={{fontWeight:600,fontSize:13,color:"#fff",marginBottom:3}}>{c.title}</div>
            <div style={{fontSize:11,color:"#6b7db3",lineHeight:1.4}}>{c.desc}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14,border:`1px solid ${AC}22`}}>
        <div style={{fontSize:12,fontWeight:600,color:AC,marginBottom:8}}>⚡ Tip of the Day</div>
        <div style={{fontSize:13,color:"#b0b8d0",lineHeight:1.6}}>Always test the start relay before replacing a compressor. Shake it near your ear — a rattling sound means it is dead. This fixes 40% of all compressor failure calls.</div>
      </div>
    </div>
  );
}

// Error Codes
function Errors() {
  const [app,setApp]=useState("");
  const [brand,setBrand]=useState("");
  const [brands,setBrands]=useState([]);
  const [codes,setCodes]=useState([]);
  const [sel,setSel]=useState(null);
  const [loading,setLoading]=useState(false);
  const loadBrands=async(a)=>{
    setLoading(true);
    const data=await api("error_codes",{filter:`?appliance=eq.${a}&select=brand`});
    setBrands([...new Set((data||[]).map(d=>d.brand))]);
    setLoading(false);
  };
  const loadCodes=async(a,b)=>{
    setLoading(true);
    const data=await api("error_codes",{filter:`?appliance=eq.${a}&brand=eq.${encodeURIComponent(b)}&select=*`});
    setCodes(data||[]);setSel(null);setLoading(false);
  };
  return (
    <div style={{padding:16}}>
      <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>🔴 Error Code Lookup</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:16}}>Select appliance → brand → error code</div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {[{v:"fridge",l:"🧊 Fridge"},{v:"washing",l:"🌀 Washing"},{v:"ac",l:"❄️ AC"}].map(o=>(
          <button key={o.v} onClick={()=>{setApp(o.v);setBrand("");setCodes([]);setSel(null);loadBrands(o.v);}}
            style={{flex:1,padding:"10px 4px",borderRadius:10,border:app===o.v?`2px solid ${PC}`:"1px solid #2a3050",background:app===o.v?"#1a2a1a":"#1a1f2e",color:app===o.v?"#fff":"#6b7db3",fontSize:11,cursor:"pointer",fontWeight:600}}>{o.l}</button>
        ))}
      </div>
      {brands.length>0&&<select value={brand} onChange={e=>{setBrand(e.target.value);loadCodes(app,e.target.value);}}
        style={{width:"100%",padding:"11px 12px",borderRadius:10,border:"1px solid #2a3050",background:"#1a1f2e",color:brand?"#fff":"#6b7db3",fontSize:13,outline:"none",marginBottom:12}}>
        <option value="">-- Select Brand --</option>
        {brands.map(b=><option key={b} value={b}>{b}</option>)}
      </select>}
      {loading&&<div style={{textAlign:"center",color:"#6b7db3",padding:20}}>Loading from database...</div>}
      {codes.length>0&&<select value={sel?.id||""} onChange={e=>setSel(codes.find(c=>c.id===e.target.value)||null)}
        style={{width:"100%",padding:"11px 12px",borderRadius:10,border:"1px solid #2a3050",background:"#1a1f2e",color:sel?"#fff":"#6b7db3",fontSize:13,outline:"none",marginBottom:14}}>
        <option value="">-- Select Error Code --</option>
        {codes.map(c=><option key={c.id} value={c.id}>{c.error_code} — {c.meaning}</option>)}
      </select>}
      {!loading&&brand&&codes.length===0&&<div style={{background:"#1a1f2e",borderRadius:12,padding:14,textAlign:"center",color:"#6b7db3",fontSize:13}}>No codes yet for this brand.</div>}
      {sel&&(
        <div style={{background:"#1a1f2e",borderRadius:14,border:`1px solid ${PC}44`,overflow:"hidden"}}>
          <div style={{background:"#1a2a1a",padding:"14px 16px",borderBottom:"1px solid #2a3050",display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:"#ff475722",borderRadius:8,padding:"5px 11px",color:"#ff4757",fontWeight:700,fontSize:16}}>{sel.error_code}</div>
            <div style={{fontWeight:600,fontSize:14,color:"#fff"}}>{sel.meaning}</div>
          </div>
          <div style={{padding:16}}>
            {sel.indoor_led_blinks>0&&<div style={{background:"#0f1117",borderRadius:8,padding:10,marginBottom:10}}>
              <div style={{fontSize:10,color:AC,fontWeight:600,textTransform:"uppercase",marginBottom:4}}>LED Blinks</div>
              <div style={{fontSize:12,color:"#e8eaf0"}}>Indoor: {sel.indoor_led_blinks} blinks · Outdoor: {sel.outdoor_led_blinks} blinks</div>
            </div>}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:600,color:AC,textTransform:"uppercase",marginBottom:6}}>🔍 Cause</div>
              <div style={{fontSize:13,color:"#b0b8d0",lineHeight:1.6,background:"#0f1117",borderRadius:8,padding:12}}>{sel.cause}</div>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:600,color:PC,textTransform:"uppercase",marginBottom:6}}>🔧 How to Fix</div>
              <div style={{fontSize:13,color:"#b0b8d0",lineHeight:1.6,background:"#0f1117",borderRadius:8,padding:12}}>{sel.how_to_fix}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wiring Diagrams
function Wiring() {
  const [cat,setCat]=useState("Fridge");
  const [items,setItems]=useState([]);
  const [exp,setExp]=useState(null);
  const [modal,setModal]=useState(null);
  const [loading,setLoading]=useState(false);
  useEffect(()=>{
    setLoading(true);
    api("wiring_diagrams",{filter:`?category=eq.${cat}&select=*`}).then(d=>{setItems(d||[]);setLoading(false);});
  },[cat]);
  return (
    <div style={{padding:16}}>
      <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>⚡ Wiring Diagrams</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:16}}>Tap to view full image</div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {["Fridge","Washing","AC"].map(c=>(
          <button key={c} onClick={()=>{setCat(c);setExp(null);}}
            style={{flex:1,padding:"9px 4px",borderRadius:10,border:cat===c?`2px solid ${AC}`:"1px solid #2a3050",background:cat===c?"#1a2a0a":"#1a1f2e",color:cat===c?AC:"#6b7db3",fontSize:11,cursor:"pointer",fontWeight:600}}>
            {c==="Fridge"?"🧊":c==="Washing"?"🌀":"❄️"} {c}
          </button>
        ))}
      </div>
      {loading&&<div style={{textAlign:"center",color:"#6b7db3",padding:20}}>Loading...</div>}
      {!loading&&items.length===0&&<div style={{background:"#1a1f2e",borderRadius:14,padding:24,textAlign:"center",border:"1px solid #2a3050"}}><div style={{fontSize:32,marginBottom:8}}>📂</div><div style={{fontSize:13,color:"#6b7db3"}}>No diagrams yet. Check back soon!</div></div>}
      {items.map((item,i)=>(
        <div key={item.id} style={{background:"#1a1f2e",borderRadius:14,border:"1px solid #2a3050",marginBottom:12,overflow:"hidden"}}>
          <div onClick={()=>setExp(exp===i?null:i)} style={{padding:"13px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:8,background:`${AC}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚡</div>
              <div>
                <div style={{fontWeight:600,fontSize:13,color:"#fff",marginBottom:2}}>{item.title}</div>
                <div style={{fontSize:11,color:"#6b7db3"}}>{item.description}</div>
              </div>
            </div>
            <div style={{color:PC,fontSize:16}}>{exp===i?"▲":"▼"}</div>
          </div>
          {exp===i&&<div style={{borderTop:"1px solid #2a3050"}}>
            {item.image_url?(
              <div style={{padding:12,background:"#0a0d14"}}>
                <img src={item.image_url} alt={item.title} onClick={()=>setModal(item.image_url)}
                  style={{width:"100%",borderRadius:10,cursor:"pointer",border:`1px solid ${PC}44`}}/>
                <div style={{textAlign:"center",marginTop:6,fontSize:11,color:"#6b7db3"}}>Tap image to fullscreen</div>
              </div>
            ):(
              <div style={{padding:24,textAlign:"center",background:"#0a0d14"}}><div style={{fontSize:32,marginBottom:8}}>🖼️</div><div style={{fontSize:12,color:"#6b7db3"}}>Image coming soon</div></div>
            )}
            {item.tips&&item.tips.length>0&&<div style={{padding:14}}>
              <div style={{fontSize:10,fontWeight:600,color:AC,textTransform:"uppercase",marginBottom:8}}>💡 Tips</div>
              {item.tips.map((t,ti)=>(
                <div key={ti} style={{display:"flex",gap:8,marginBottom:6}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:`${AC}22`,color:AC,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{ti+1}</div>
                  <div style={{fontSize:12,color:"#b0b8d0"}}>{t}</div>
                </div>
              ))}
            </div>}
          </div>}
        </div>
      ))}
      {modal&&<div onClick={()=>setModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <img src={modal} alt="" style={{maxWidth:"100%",maxHeight:"90vh",borderRadius:12}}/>
        <button onClick={()=>setModal(null)} style={{position:"absolute",top:20,right:20,width:32,height:32,borderRadius:"50%",background:"#ff4757",border:"none",color:"#fff",fontSize:16,cursor:"pointer"}}>✕</button>
      </div>}
    </div>
  );
}

// Tips & Tricks
function TipsTricks() {
  const [sub,setSub]=useState("All");
  const [tips,setTips]=useState([]);
  const [sel,setSel]=useState(null);
  const [loading,setLoading]=useState(true);
  const SUBS=["All","Wiring Connection","Sensor Values","General","Safety","Tools"];
  useEffect(()=>{
    api("tips_tricks",{filter:"?select=*&order=created_at.desc"}).then(d=>{setTips(d||[]);setLoading(false);});
  },[]);
  const filtered=sub==="All"?tips:tips.filter(t=>t.sub_category===sub||t.category===sub);
  return (
    <div style={{padding:16}}>
      <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>💡 Tips & Tricks</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:12}}>Expert repair knowledge from the database</div>
      <div style={{overflowX:"auto",display:"flex",gap:8,marginBottom:16,paddingBottom:4}}>
        {SUBS.map(s=><button key={s} onClick={()=>{setSub(s);setSel(null);}}
          style={{whiteSpace:"nowrap",padding:"7px 14px",borderRadius:20,border:sub===s?`2px solid ${AC}`:"1px solid #2a3050",background:sub===s?`${AC}22`:"#1a1f2e",color:sub===s?AC:"#6b7db3",fontSize:11,cursor:"pointer",fontWeight:sub===s?600:400}}>{s}</button>)}
      </div>
      {loading&&<div style={{textAlign:"center",color:"#6b7db3",padding:20}}>Loading...</div>}
      {!loading&&filtered.length===0&&<div style={{background:"#1a1f2e",borderRadius:14,padding:24,textAlign:"center",border:"1px solid #2a3050"}}><div style={{fontSize:32,marginBottom:8}}>💡</div><div style={{fontSize:13,color:"#6b7db3"}}>No tips yet. Check back soon!</div></div>}
      {filtered.map((tip,i)=>(
        <div key={tip.id} style={{background:"#1a1f2e",borderRadius:14,border:`1px solid ${AC}22`,marginBottom:12,overflow:"hidden"}}>
          <div onClick={()=>setSel(sel===i?null:i)} style={{padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:38,height:38,borderRadius:10,background:`${AC}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>💡</div>
              <div>
                <div style={{fontWeight:600,fontSize:13,color:"#fff",marginBottom:2}}>{tip.title}</div>
                <div style={{fontSize:11,color:AC}}>{tip.sub_category||tip.category||"General"}</div>
              </div>
            </div>
            <div style={{color:AC,fontSize:16}}>{sel===i?"▲":"▼"}</div>
          </div>
          {sel===i&&<div style={{borderTop:"1px solid #2a3050",padding:"14px 16px"}}>
            <div style={{fontSize:13,color:"#e8eaf0",lineHeight:1.7,marginBottom:12}}>{tip.description}</div>
            {tip.media_type==="image"&&tip.media_url&&<img src={tip.media_url} alt="" style={{width:"100%",borderRadius:10,marginBottom:8}}/>}
            {tip.media_type==="video_url"&&tip.media_url&&<a href={tip.media_url} target="_blank" rel="noreferrer"
              style={{display:"flex",alignItems:"center",gap:10,background:`${AC}11`,borderRadius:10,padding:"12px 16px",border:`1px solid ${AC}33`,textDecoration:"none"}}>
              <div style={{fontSize:24}}>▶️</div><div style={{fontSize:13,color:AC,fontWeight:600}}>Watch Video</div>
            </a>}
            {tip.media_type==="upload"&&tip.media_data&&<img src={tip.media_data} alt="" style={{width:"100%",borderRadius:10}}/>}
          </div>}
        </div>
      ))}
    </div>
  );
}

// Sensor Values
function SensorValues() {
  const [tips,setTips]=useState([]);
  const [sel,setSel]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    api("tips_tricks",{filter:"?sub_category=eq.Sensor%20Values&select=*"}).then(d=>{setTips(d||[]);setLoading(false);});
  },[]);
  return (
    <div style={{padding:16}}>
      <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>📡 Sensor Values</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:16}}>Component test values and sensor readings</div>
      {loading&&<div style={{textAlign:"center",color:"#6b7db3",padding:20}}>Loading...</div>}
      {!loading&&tips.length===0&&<div style={{background:"#1a1f2e",borderRadius:14,padding:24,textAlign:"center",border:"1px solid #2a3050"}}><div style={{fontSize:32,marginBottom:8}}>📡</div><div style={{fontSize:13,color:"#6b7db3"}}>Sensor values content coming soon!</div></div>}
      {tips.map((tip,i)=>(
        <div key={tip.id} style={{background:"#1a1f2e",borderRadius:14,border:"1px solid #2a3050",marginBottom:10,overflow:"hidden"}}>
          <div onClick={()=>setSel(sel===i?null:i)} style={{padding:"13px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontWeight:600,fontSize:13,color:"#fff"}}>{tip.title}</div>
            <div style={{color:PC,fontSize:16}}>{sel===i?"▲":"▼"}</div>
          </div>
          {sel===i&&<div style={{borderTop:"1px solid #2a3050",padding:"14px 16px"}}>
            <div style={{fontSize:13,color:"#e8eaf0",lineHeight:1.7}}>{tip.description}</div>
            {tip.media_url&&<img src={tip.media_url} alt="" style={{width:"100%",borderRadius:10,marginTop:10}}/>}
          </div>}
        </div>
      ))}
    </div>
  );
}

// Community
function Community({user}) {
  const [posts,setPosts]=useState([]);
  const [newPost,setNewPost]=useState("");
  const [replyTo,setReplyTo]=useState(null);
  const [replyText,setReplyText]=useState("");
  const [error,setError]=useState("");
  const [aiThinking,setAiThinking]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    api("community_posts",{filter:"?select=*,community_replies(*)&order=created_at.desc"}).then(d=>{setPosts(d||[]);setLoading(false);});
  },[]);
  const submitPost=async()=>{
    const mod=moderate(newPost);
    if(mod.blocked){setError(mod.reason);return;}
    if(!newPost.trim())return;
    const res=await api("community_posts",{method:"POST",body:{author_name:user?.full_name||"Technician",text:newPost},prefer:"return=representation"});
    const post=Array.isArray(res)?res[0]:null;
    if(post){
      setPosts(prev=>[{...post,community_replies:[]},...prev]);
      setNewPost("");setError("");
      setAiThinking(post.id);
      try{
        const aiRes=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:200,messages:[{role:"user",content:`You are PCB AI, expert appliance repair bot. Reply in 2 sentences max to: "${newPost}"`}]})});
        const aiData=await aiRes.json();
        const reply=aiData.content?.map(i=>i.text||"").join("")||"Good question!";
        await api("community_replies",{method:"POST",body:{post_id:post.id,author_name:"PCB AI 🤖",text:reply,is_ai:true},prefer:"return=minimal"});
        setPosts(prev=>prev.map(p=>p.id===post.id?{...p,community_replies:[...p.community_replies,{author_name:"PCB AI 🤖",text:reply,is_ai:true}]}:p));
      }catch{}
      setAiThinking(null);
    }
  };
  const submitReply=async(postId)=>{
    const mod=moderate(replyText);
    if(mod.blocked){setError(mod.reason);return;}
    await api("community_replies",{method:"POST",body:{post_id:postId,author_name:user?.full_name||"Technician",text:replyText},prefer:"return=minimal"});
    setPosts(prev=>prev.map(p=>p.id===postId?{...p,community_replies:[...p.community_replies,{author_name:user?.full_name||"Technician",text:replyText,is_ai:false}]}:p));
    setReplyText("");setReplyTo(null);setError("");
  };
  return (
    <div style={{padding:16}}>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:18,fontWeight:700,color:"#fff"}}>👥 Community</div>
        <div style={{fontSize:11,color:PC}}>🤖 AI Bot Active · Monitoring Posts</div>
      </div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:14,marginBottom:14,border:"1px solid #2a3050"}}>
        <textarea value={newPost} onChange={e=>{setNewPost(e.target.value);setError("");}} placeholder="Ask a repair question... (No phone numbers, URLs, or abusive language)" rows={3}
          style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
        {error&&<div style={{color:"#ff4757",fontSize:12,marginTop:4,padding:"6px 10px",background:"#ff475711",borderRadius:6}}>⚠ {error}</div>}
        <button onClick={submitPost} disabled={!newPost.trim()} style={{marginTop:8,padding:"10px 20px",borderRadius:10,background:`linear-gradient(135deg,${PC},${AC})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:13}}>Post</button>
      </div>
      {loading&&<div style={{textAlign:"center",color:"#6b7db3",padding:20}}>Loading posts...</div>}
      {posts.map(post=>(
        <div key={post.id} style={{background:"#1a1f2e",borderRadius:14,border:"1px solid #2a3050",marginBottom:12,overflow:"hidden"}}>
          <div style={{padding:"14px 16px"}}>
            <div style={{display:"flex",gap:10,marginBottom:10}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${PC},${AC})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#0a0d14",flexShrink:0}}>{post.author_name?.charAt(0)||"T"}</div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"#fff"}}>{post.author_name}</div>
                <div style={{fontSize:10,color:"#6b7db3"}}>{new Date(post.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            <div style={{fontSize:13,color:"#e8eaf0",lineHeight:1.6}}>{post.text}</div>
          </div>
          {post.community_replies?.length>0&&<div style={{borderTop:"1px solid #2a3050"}}>
            {post.community_replies.map((r,i)=>(
              <div key={i} style={{padding:"10px 16px 10px 26px",background:r.is_ai?"#0f1117":"transparent",borderBottom:i<post.community_replies.length-1?"1px solid #1a1f2e":"none"}}>
                <div style={{display:"flex",gap:8,marginBottom:4}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:r.is_ai?"#4caf5033":"#2a3050",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:r.is_ai?"#4caf50":"#e8eaf0",flexShrink:0}}>{r.is_ai?"AI":r.author_name?.charAt(0)||"T"}</div>
                  <div style={{fontSize:11,fontWeight:600,color:r.is_ai?"#4caf50":"#fff"}}>{r.author_name}</div>
                </div>
                <div style={{fontSize:12,color:"#b0b8d0",lineHeight:1.5}}>{r.text}</div>
              </div>
            ))}
          </div>}
          {aiThinking===post.id&&<div style={{padding:"10px 16px",borderTop:"1px solid #2a3050",background:"#0f1117",display:"flex",gap:8,alignItems:"center"}}><div style={{fontSize:14}}>🤖</div><div style={{fontSize:12,color:PC}}>PCB AI is thinking...</div></div>}
          <div style={{padding:"8px 16px 12px",borderTop:"1px solid #2a3050"}}>
            {replyTo===post.id?<div>
              <input value={replyText} onChange={e=>{setReplyText(e.target.value);setError("");}} placeholder="Write a reply..."
                style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:6}}/>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>submitReply(post.id)} style={{padding:"7px 14px",borderRadius:8,background:PC,color:"#0a0d14",border:"none",cursor:"pointer",fontSize:12,fontWeight:600}}>Reply</button>
                <button onClick={()=>setReplyTo(null)} style={{padding:"7px 14px",borderRadius:8,background:"#2a3050",color:"#6b7db3",border:"none",cursor:"pointer",fontSize:12}}>Cancel</button>
              </div>
            </div>:<button onClick={()=>setReplyTo(post.id)} style={{background:"none",border:"none",color:"#6b7db3",cursor:"pointer",fontSize:12}}>💬 Reply ({post.community_replies?.length||0})</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

// AI Chat
function AIChat() {
  const LIMIT=5;
  const today=new Date().toISOString().split("T")[0];
  const [usage,setUsage]=useState(()=>DB.get("ai_"+today,0));
  const [msgs,setMsgs]=useState([{role:"assistant",text:"Hi! I am PCB AI. I use our database of error codes, wiring diagrams, and repair knowledge to answer your questions. Ask me anything!"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [dbCtx,setDbCtx]=useState("");
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  useEffect(()=>{
    Promise.all([
      api("error_codes",{filter:"?select=appliance,brand,error_code,meaning,cause,how_to_fix&limit=50"}),
      api("tips_tricks",{filter:"?select=title,description&limit=20"}),
    ]).then(([errors,tips])=>{
      setDbCtx("ERROR CODES: "+JSON.stringify(errors||[])+" TIPS: "+JSON.stringify(tips||[]));
    });
  },[]);
  const remaining=LIMIT-usage;
  const send=async()=>{
    if(!input.trim()||loading||usage>=LIMIT)return;
    const q=input.trim();setInput("");
    const nu=usage+1;setUsage(nu);DB.set("ai_"+today,nu);
    setMsgs(m=>[...m,{role:"user",text:q}]);
    setLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:500,messages:[{role:"user",content:`You are PCB AI, expert appliance repair assistant. Use this knowledge base: ${dbCtx}. Be concise. Question: ${q}`}]})});
      const data=await res.json();
      const reply=data.content?.map(i=>i.text||"").join("")||"Sorry, try again.";
      const left=LIMIT-nu;
      setMsgs(m=>[...m,{role:"assistant",text:reply+(left>0?" ("+left+" questions left today)":"\n\nDaily limit reached. Come back tomorrow!")}]);
    }catch{setMsgs(m=>[...m,{role:"assistant",text:"Connection error. Please try again."}]);}
    setLoading(false);
  };
  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 130px)"}}>
      <div style={{padding:"14px 16px 10px",borderBottom:"1px solid #2a3050",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:18,fontWeight:700,color:"#fff"}}>🤖 PCB AI</div><div style={{fontSize:11,color:PC}}>Powered by database knowledge</div></div>
        <div style={{background:remaining>2?"#4caf5022":remaining>0?"#ffa50222":"#ff475722",borderRadius:20,padding:"5px 10px",border:`1px solid ${remaining>2?"#4caf5044":remaining>0?"#ffa50244":"#ff475744"}`}}>
          <div style={{fontSize:11,fontWeight:700,color:remaining>2?"#4caf50":remaining>0?"#ffa502":"#ff4757"}}>{remaining}/{LIMIT} left today</div>
        </div>
      </div>
      <div style={{padding:"6px 16px",borderBottom:"1px solid #2a3050",background:"#0f1117"}}>
        <div style={{height:3,background:"#2a3050",borderRadius:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(usage/LIMIT)*100}%`,background:usage<3?"#4caf50":usage<5?"#ffa502":"#ff4757",borderRadius:4,transition:"width 0.3s"}}/>
        </div>
        {remaining===0&&<div style={{fontSize:11,color:"#ff4757",textAlign:"center",marginTop:4}}>Daily limit reached. Resets at midnight 🔄</div>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"83%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?`linear-gradient(135deg,${PC},${AC})`:"#1a1f2e",fontSize:13,color:"#e8eaf0",lineHeight:1.6,border:m.role==="assistant"?"1px solid #2a3050":"none",whiteSpace:"pre-wrap"}}>{m.text}</div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{background:"#1a1f2e",border:"1px solid #2a3050",borderRadius:"14px 14px 14px 4px",padding:"10px 16px",color:"#6b7db3",fontSize:13}}>Thinking...</div></div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"10px 14px",borderTop:"1px solid #2a3050",display:"flex",gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={remaining>0?"Ask about any appliance fault...":"Daily limit reached. Come back tomorrow."} disabled={remaining===0}
          style={{flex:1,padding:"11px 14px",borderRadius:12,border:"1px solid #2a3050",background:remaining===0?"#0a0d14":"#1a1f2e",color:remaining===0?"#3a4060":"#fff",fontSize:13,outline:"none"}}/>
        <button onClick={send} disabled={loading||!input.trim()||remaining===0} style={{width:44,height:44,borderRadius:12,background:remaining===0?"#2a3050":`linear-gradient(135deg,${PC},${AC})`,border:"none",cursor:"pointer",fontSize:16,color:"#0a0d14",display:"flex",alignItems:"center",justifyContent:"center"}}>➤</button>
      </div>
    </div>
  );
}

// Requests
function Requests({user}) {
  const [type,setType]=useState("");
  const [form,setForm]=useState({appliance:"",brand:"",description:""});
  const [submitted,setSubmitted]=useState(false);
  const [loading,setLoading]=useState(false);
  const TYPES=["Error Code","Wiring Diagram","PCB Connection","Tips & Tricks","Sensor Values"];
  const submit=async()=>{
    if(!type||!form.description)return;
    setLoading(true);
    await api("user_requests",{method:"POST",body:{user_name:user?.full_name||"Anonymous",request_type:type,appliance:form.appliance,brand:form.brand,description:form.description,status:"pending"},prefer:"return=minimal"});
    setSubmitted(true);setLoading(false);
  };
  if(submitted) return (
    <div style={{padding:16,textAlign:"center",paddingTop:60}}>
      <div style={{fontSize:40,marginBottom:12}}>✅</div>
      <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:8}}>Request Submitted!</div>
      <div style={{fontSize:13,color:"#6b7db3",marginBottom:20}}>Admin will review and add the content soon.</div>
      <button onClick={()=>{setSubmitted(false);setType("");setForm({appliance:"",brand:"",description:""}); }} style={{padding:"12px 24px",borderRadius:12,background:`linear-gradient(135deg,${PC},${AC})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700}}>Submit Another</button>
    </div>
  );
  return (
    <div style={{padding:16}}>
      <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>📥 Request Content</div>
      <div style={{fontSize:12,color:"#6b7db3",marginBottom:16}}>Request error codes, diagrams, sensor values, or tips</div>
      <div style={{background:"#1a1f2e",borderRadius:14,padding:16,border:"1px solid #2a3050"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#e8eaf0",marginBottom:10}}>Request Type <span style={{color:"#ff4757"}}>*</span></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
          {TYPES.map(t=><button key={t} onClick={()=>setType(t)}
            style={{padding:"8px 14px",borderRadius:20,border:type===t?`2px solid ${PC}`:"1px solid #2a3050",background:type===t?`${PC}22`:"#0f1117",color:type===t?PC:"#6b7db3",fontSize:12,cursor:"pointer",fontWeight:type===t?600:400}}>{t}</button>)}
        </div>
        <select value={form.appliance} onChange={e=>setForm(f=>({...f,appliance:e.target.value}))}
          style={{width:"100%",padding:"11px 12px",borderRadius:10,border:"1px solid #2a3050",background:"#0f1117",color:form.appliance?"#fff":"#6b7db3",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:10}}>
          <option value="">-- Appliance (Optional) --</option>
          {["Fridge","Washing Machine","AC","Other"].map(a=><option key={a} value={a}>{a}</option>)}
        </select>
        <input value={form.brand} onChange={e=>setForm(f=>({...f,brand:e.target.value}))} placeholder="Brand (Optional)"
          style={{width:"100%",padding:"11px 12px",borderRadius:10,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
        <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Describe what you need in detail... *" rows={4}
          style={{width:"100%",padding:"11px 12px",borderRadius:10,border:"1px solid #2a3050",background:"#0f1117",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit",marginBottom:14}}/>
        <button onClick={submit} disabled={!type||!form.description||loading}
          style={{width:"100%",padding:"13px",borderRadius:10,background:!type||!form.description?"#2a3050":`linear-gradient(135deg,${PC},${AC})`,color:"#0a0d14",border:"none",cursor:"pointer",fontWeight:700,fontSize:14}}>
          {loading?"Submitting...":"Submit Request"}
        </button>
      </div>
    </div>
  );
}

// ── ADMIN PANEL ───────────────────────────────────────────────────────────────
function AdminPanel({onClose}) {
  const [tab,setTab]=useState("insights");
  const [online]=useState(Math.floor(Math.random()*12)+3);
  const tabs=[
    {id:"insights",icon:"📊",label:"Insights"},
    {id:"users",icon:"👥",label:"Users"},
    {id:"errors",icon:"🔴",label:"Errors"},
    {id:"wiring",icon:"⚡",label:"Wiring"},
    {id:"tips",icon:"💡",label:"Tips"},
    {id:"requests",icon:"📥",label:"Requests"},
    {id:"community",icon:"🗣️",label:"Posts"},
  ];
  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"#0a0d14",minHeight:"100vh",color:"#e8eaf0",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:"#1a1f2e",borderBottom:"1px sol
