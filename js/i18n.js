(function(){
  var STORAGE_KEY = "finscheme_lang";
  var SUPPORTED = ["en", "hi", "mr"];
  var LABELS = { en: "English", hi: "Hindi", mr: "Marathi" };
  var listeners = [];
  var SELECTOR_CLASS = "lang";

  function safeLang(lang){
    if(SUPPORTED.indexOf(lang) >= 0) return lang;
    return "en";
  }

  function readStoredLang(){
    try { return localStorage.getItem(STORAGE_KEY); } catch(_e) { return null; }
  }

  function writeStoredLang(lang){
    try { localStorage.setItem(STORAGE_KEY, lang); } catch(_e) {}
  }

  function detectInitialLang(){
    var stored = readStoredLang();
    if(stored) return safeLang(stored);
    var docLang = document.documentElement.getAttribute("lang");
    if(docLang) return safeLang(docLang.toLowerCase());
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language;
    if(nav) return safeLang(nav.toLowerCase().split("-")[0]);
    return "en";
  }

  var currentLang = detectInitialLang();

  function getLanguage(){
    return currentLang;
  }

  function setLanguage(lang){
    var next = safeLang(lang);
    if(next === currentLang) return;
    currentLang = next;
    writeStoredLang(next);
    document.documentElement.setAttribute("lang", next);
    applyGoogleLanguage(next);
    listeners.forEach(function(fn){
      try { fn(next); } catch(_e) {}
    });
    window.dispatchEvent(new CustomEvent("finscheme:langchange", { detail: { lang: next } }));
  }

  function onLanguageChange(fn){
    if(typeof fn === "function") listeners.push(fn);
  }

  function getSchemeFile(lang){
    var active = safeLang(lang || getLanguage());
    var base = location.pathname.indexOf('/pages/') !== -1 ? '../data/' : 'data/';
    if(active === 'hi') return base + 'schemes_hi.json';
    if(active === 'mr') return base + 'schemes_mr.json';
    return base + 'schemes_en.json';
  }

  function ensureSelector(){
    var select = document.querySelector("select." + SELECTOR_CLASS);
    if(!select){
      var nav = document.querySelector(".nav .nav-links") || document.querySelector(".topbar .nav");
      select = document.createElement("select");
      select.className = SELECTOR_CLASS;
      select.setAttribute("aria-label", "Language");
      if(nav){
        nav.appendChild(select);
      }else{
        document.body.appendChild(select);
      }
    }

    select.innerHTML = "";
    SUPPORTED.forEach(function(code){
      var option = document.createElement("option");
      option.value = code;
      option.textContent = LABELS[code];
      select.appendChild(option);
    });

    select.value = getLanguage();
    if(!select.dataset.finschemeBound){
      select.addEventListener("change", function(){
        setLanguage(select.value);
      });
      select.dataset.finschemeBound = "1";
    }

    onLanguageChange(function(lang){
      if(select.value !== lang) select.value = lang;
    });
  }

  function injectStyles(){
    if(document.getElementById("finscheme-i18n-style")) return;
    var style = document.createElement("style");
    style.id = "finscheme-i18n-style";
    style.textContent = ""
      + "select.lang { padding: 8px 14px; border-radius: 12px; border: 1px solid rgba(15, 23, 42, 0.1); background: rgba(255, 255, 255, 0.9); font-size: 13px; font-weight: 700; color: #0f172a; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px -8px rgba(15, 23, 42, 0.2); backdrop-filter: blur(8px); }"
      + "select.lang:hover { border-color: var(--primary); transform: translateY(-1px); box-shadow: 0 8px 16px -8px rgba(15, 118, 110, 0.3); }"
      + "select.lang:focus { outline: none; border-color: var(--primary); ring: 2px solid rgba(15, 118, 110, 0.1); }"
      + "#google_translate_element { position: fixed; left: -9999px; top: -9999px; visibility: hidden; }"
      + "body { top: 0 !important; }"
      + ".goog-te-banner-frame.skiptranslate { display: none !important; }";
    document.head.appendChild(style);
  }

  function setGoogTransCookie(value){
    var expires = "expires=Fri, 31 Dec 9999 23:59:59 GMT";
    document.cookie = "googtrans=" + value + "; " + expires + "; path=/";
    document.cookie = "googtrans=" + value + "; " + expires + "; path=/; domain=" + location.hostname;
  }

  function applyGoogleLanguage(lang){
    var combo = document.querySelector(".goog-te-combo");
    if(!combo){
      setGoogTransCookie("/en/" + lang);
      return;
    }
    combo.value = lang;
    combo.dispatchEvent(new Event("change"));
  }

  function initGoogleTranslate(){
    if(!window.google || !window.google.translate || !window.google.translate.TranslateElement) return;
    if(document.getElementById("google_translate_element")) return;

    var host = document.createElement("div");
    host.id = "google_translate_element";
    document.body.appendChild(host);

    new window.google.translate.TranslateElement({
      pageLanguage: "en",
      includedLanguages: "en,hi,mr",
      autoDisplay: false
    }, "google_translate_element");

    var lang = getLanguage();
    setTimeout(function(){ applyGoogleLanguage(lang); }, 600);
  }

  window.googleTranslateElementInit = initGoogleTranslate;

  function loadGoogleScript(){
    if(document.querySelector('script[data-finscheme-gt="1"]')) return;
    var script = document.createElement("script");
    script.async = true;
    script.dataset.finschemeGt = "1";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.head.appendChild(script);
  }

  function init(){
    document.documentElement.setAttribute("lang", getLanguage());
    injectStyles();
    ensureSelector();
    loadGoogleScript();
  }

  window.FinSchemeI18n = {
    getLanguage: getLanguage,
    setLanguage: setLanguage,
    onLanguageChange: onLanguageChange,
    getSchemeFile: getSchemeFile
  };

  window.addEventListener("storage", function(evt){
    if(!evt || evt.key !== STORAGE_KEY) return;
    var next = safeLang(evt.newValue || "en");
    if(next !== currentLang) setLanguage(next);
  });

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  }else{
    init();
  }
})();