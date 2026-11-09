// Je Falla : connexion à Supabase (clé publique uniquement, jamais de clé secrète ici)
var SB="https://bqrstfitrxjzqjotyuhd.supabase.co",KEY="sb_publishable_-Pd_zDFHwdegW43-3v9tDA_iS-rkjQc";
var sess=null;try{sess=JSON.parse(localStorage.getItem("jf_sess"))}catch(e){}
function saveS(j){if(j&&j.access_token){sess={access_token:j.access_token,refresh_token:j.refresh_token,user:j.user||(sess&&sess.user)};try{localStorage.setItem("jf_sess",JSON.stringify(sess))}catch(e){}}}
function deconnecter(){sess=null;try{localStorage.removeItem("jf_sess")}catch(e){}}
function tel(n){var d=String(n||"").replace(/\D/g,"");if(d.length===9)d="237"+d;return d}
function traduire(m){m=String(m||"");if(/Invalid login/i.test(m))return "Numéro ou mot de passe incorrect.";if(/already registered/i.test(m))return "Ce numéro a déjà un compte. Connecte-toi.";if(/signups? (are )?disabled/i.test(m))return "Les inscriptions sont désactivées dans Supabase.";if(/Password should/i.test(m))return "Mot de passe trop court (6 caractères minimum).";return m||"Erreur"}
function raw(path,o){o=o||{};var h={apikey:KEY,"Content-Type":"application/json"};if(sess&&!o.noauth)h.Authorization="Bearer "+sess.access_token;if(o.prefer)h.Prefer=o.prefer;
return fetch(SB+path,{method:o.method||"GET",headers:h,body:o.body?JSON.stringify(o.body):undefined}).then(function(r){return r.text().then(function(t){var j=null;try{j=t?JSON.parse(t):null}catch(e){}if(!r.ok)throw new Error(traduire(j&&(j.msg||j.message||j.error_description||j.error)||("Erreur "+r.status)));return j})})}
// Si la session a expiré, on la renouvelle une fois puis on réessaie
function api(path,o){return raw(path,o).catch(function(e){if(sess&&sess.refresh_token&&/JWT|expired/i.test(e.message)){return raw("/auth/v1/token?grant_type=refresh_token",{method:"POST",noauth:1,body:{refresh_token:sess.refresh_token}}).then(function(j){saveS(j);return raw(path,o)}).catch(function(){deconnecter();throw e})}throw e})}
// Compte unique : le numéro de téléphone sert d’identifiant (pas de SMS, donc gratuit)
function inscrire(n,p,nom){return raw("/auth/v1/signup",{method:"POST",noauth:1,body:{email:tel(n)+"@jefalla.app",password:p,data:{full_name:nom}}}).then(function(j){saveS(j);return !!(j&&j.access_token)})}
function connecter(n,p){return raw("/auth/v1/token?grant_type=password",{method:"POST",noauth:1,body:{email:tel(n)+"@jefalla.app",password:p}}).then(saveS)}
