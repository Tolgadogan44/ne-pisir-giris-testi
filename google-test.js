import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { initializeAuth, browserPopupRedirectResolver, inMemoryPersistence, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
const $ = id => document.getElementById(id);
const ready=$("ready"),button=$("googleBtn"),status=$("status");
function show(kind,msg){status.className=kind;status.textContent=msg;}
let auth;
try{
  const app=initializeApp({apiKey:"AIzaSyCiuFGV1wb91YIhuVzOmNI3kk69ibglh_8",authDomain:"nepisir-b8b50.firebaseapp.com",projectId:"nepisir-b8b50"});
  auth=initializeAuth(app,{persistence:inMemoryPersistence,popupRedirectResolver:browserPopupRedirectResolver});
  auth.languageCode="tr";
  ready.textContent="✅ Google giriş modülü hazır. Bu sayfa için Firebase yetkili alan adı ayarı da gerekli.";
  button.disabled=false;
}catch(e){
  ready.textContent="❌ Google giriş modülü başlatılamadı. "+String(e?.code||e?.message||"Bilinmeyen hata");
}
button.addEventListener("click",async function(){
 if(button.disabled||!auth)return;
 button.disabled=true;
 show("pending","🔵 Google'ın resmî giriş penceresi açılıyor…");
 try{
   // Must run directly from the click to avoid popup-blocker restrictions.
   const result=await signInWithPopup(auth,new GoogleAuthProvider());
   const u=result.user;
   if(!u?.uid||!u.providerData?.some(p=>p.providerId==="google.com"))throw Error("Google sağlayıcısı doğrulanamadı.");
   show("ok","✅ GOOGLE GİRİŞİ BAŞARILI\nFirebase Google hesabını doğruladı.\nGoogle sağlayıcısı: google.com\nE-posta doğrulaması: "+(u.emailVerified?"Tamamlandı":"Henüz yapılmadı")+"\n\nGoogle şifreni veya hesap kimliğini kimseyle paylaşma.");
 }catch(e){
   const code=String(e?.code||"Bilinmeyen hata");
   const errors={
     "auth/unauthorized-domain":"GitHub Pages alan adı Firebase Authentication > Settings > Authorized domains listesine eklenmeli.",
     "auth/popup-blocked":"Tarayıcı giriş penceresini engelledi. Normal tarayıcı ayarlarına uygun şekilde tekrar denenebilir; şirket politikalarını değiştirme.",
     "auth/popup-closed-by-user":"Google giriş penceresi kapatıldı. Hesap seçimi tamamlanmadı.",
     "auth/cancelled-popup-request":"Giriş isteği iptal edildi.",
     "auth/account-exists-with-different-credential":"Bu e-posta mevcut farklı bir giriş yöntemine bağlı. Hesap eşleştirme ayrıca incelenmeli; otomatik işlem yapılmadı.",
     "auth/operation-not-allowed":"Firebase'de Google sağlayıcısı etkin değil.",
     "auth/network-request-failed":"Tarayıcı/ağ isteği engellendi veya internet bağlantısı kesildi.",
     "auth/internal-error":"Firebase/Google giriş işlemi sırasında beklenmeyen hata."
   };
   show("error","❌ GOOGLE GİRİŞİ TAMAMLANAMADI\n"+(errors[code]||code)+"\n\nŞifreni veya Google kimlik jetonunu paylaşma.");
 }finally{
   try{if(auth.currentUser)await signOut(auth);}catch(_){}
   button.disabled=false;
 }
});
