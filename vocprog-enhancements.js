/* vocprog staging extension – 2026-11-05
   Depends on original index.html global script. Keep legacy main unmodified. */
(() => {
  "use strict";
  const DB_URL = "https://yiayotftqqaivoxvuzmz.supabase.co";
  const PUB_KEY = "sb_publishable_av4X69ihuWUjgxZqoEm9WA_2b9h-elp";
  const STORE = "vocprog_v2";
  const LANGS = {"en-US":"Englisch","fr-FR":"Französisch","es-ES":"Spanisch","la-LA":"Lateinisch","pt-PT":"Portugiesisch","nl-NL":"Niederländisch"};
  const get = id => document.getElementById(id);
  const id = () => globalThis.crypto?.randomUUID?.() || ("v"+Date.now().toString(36)+Math.random().toString(36).slice(2));
  const read = (key,fallback) => { try {return JSON.parse(localStorage.getItem(key)) ?? fallback;} catch {return fallback;} };
  const save = (key,value) => localStorage.setItem(key,JSON.stringify(value));
  let books = read(STORE+"_books",[]);
  let specials = read(STORE+"_special",[]);
  let history = read(STORE+"_events",[]);
  let tombstones = read(STORE+"_tombstones",[]);

  let chosenBook = localStorage.getItem(STORE+"_book") || "";
  let chosenForScan = "";
  let lastSync = localStorage.getItem(STORE+"_synced") || "";
  let analysisInterrupted = false;
  let analyzedThisCard = false;
  let lastShownEvent = null;
  let syncTimer = null;
  let syncing = false;
  let scanQueueReady = false;
  let dbPromise;

  function imageDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve,reject) => {
      const req=indexedDB.open("vocprog-temporary-images",1);
      req.onupgradeneeded=()=>req.result.createObjectStore("pending");
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
    return dbPromise;
  }
  async function tempImages(value) {
    try {
      const db=await imageDb();
      return await new Promise((resolve,reject)=>{
        const tx=db.transaction("pending",value===undefined?"readonly":"readwrite");
        const req=value===undefined?tx.objectStore("pending").get("images"):
          tx.objectStore("pending").put(value,"images");
        req.onsuccess=()=>resolve(req.result);
        req.onerror=()=>reject(req.error);
      });
    } catch(e) { console.warn("Temp image persistence unavailable",e); return null; }
  }
  function allVocab() {
    return Object.keys(localStorage).filter(k=>k.startsWith("vocab_trainer_data_")).flatMap(k=>{
      const lang=k.slice("vocab_trainer_data_".length);
      return (read(k,[]) || []).map(v=>({...v, lang:v.lang||lang}));
    });
  }
  function ensureMigration() {
    let didChange=false;
    for(const lang of Object.keys(LANGS)) {
      const k="vocab_trainer_data_"+lang, data=read(k,[]);
      if (!Array.isArray(data)||!data.length) continue;
      let book=books.find(b=>b.lang===lang);
      if(!book) {
        book={id:id(),name:"Muster",lang,updatedAt:new Date().toISOString()};
        books.push(book); didChange=true;
      }
      for(const v of data) {
        if(!v.id){v.id=id();didChange=true;}
        if(!v.bookId){v.bookId=book.id;didChange=true;}
        if(!v.updatedAt){v.updatedAt=new Date().toISOString();didChange=true;}
      }
      if(didChange) save(k,data);
    }
    if(didChange) save(STORE+"_books",books);
    if(!chosenBook||!books.some(b=>b.id===chosenBook)) chosenBook=books[0]?.id||"";
    localStorage.setItem(STORE+"_book",chosenBook);
  }
  function persistMetadata(){
    save(STORE+"_books",books);save(STORE+"_special",specials);save(STORE+"_events",history);save(STORE+"_tombstones",tombstones);
    localStorage.setItem(STORE+"_book",chosenBook);
    scheduleSync();
  }
  function ranges(pages){
    const nums=[...new Set(pages.map(Number).filter(Number.isFinite))].sort((a,b)=>a-b);
    if(!nums.length)return "–";
    const blocks=[];let first=nums[0],last=first;
    for(const n of nums.slice(1)){if(n===last+1){last=n;continue;}blocks.push(first===last?String(first):first+"–"+last);first=last=n;}
    blocks.push(first===last?String(first):first+"–"+last);return blocks.join(", ");
  }
  function bookText(b){
    const v=allVocab().filter(x=>x.bookId===b.id);
    return b.name+" ("+(LANGS[b.lang]||"Sprache noch nicht erkannt")+")"+(v.length?": S. "+ranges(v.map(x=>x.page)):"");
  }
  function renderBooks(){
    const el=get("scannedPagesBadge");if(!el)return;
    const selected=books.find(b=>b.id===chosenBook);
    el.textContent=selected?bookText(selected):"Noch kein Buch vorhanden";
    get("renameBookBtn").disabled=!selected;
    get("deleteBookBtn").disabled=!selected;
  }
  function refreshBookChoices(){
    const select=get("bookSelect");if(!select)return;
    select.replaceChildren();
    for(const b of books)select.add(new Option(bookText(b),b.id));
    if(!books.some(b=>b.id===chosenBook))chosenBook=books[0]?.id||"";
    if(chosenBook)select.value=chosenBook;
    renderBooks();
  }
  window.renameSelectedBook=function(){
    const b=books.find(x=>x.id===chosenBook);if(!b)return;
    const name=prompt("Neuer Buchname:",b.name);
    if(name===null)return;
    if(!name.trim())return alert("Ein Buchname darf nicht leer sein.");
    b.name=name.trim();b.updatedAt=new Date().toISOString();
    persistMetadata();refreshBookChoices();
  };
  function markDeleted(type,entity,date){
    const key=type+":"+entity.id;
    const i=tombstones.findIndex(t=>t.record_id===key);
    const obj={record_id:key,record_type:type,payload:{id:entity.id,deleted:true,updatedAt:date},updated_at:date};
    if(i>=0)tombstones[i]=obj;else tombstones.push(obj);
  }
  function removeBookLocally(bookId,date){
    const book=books.find(b=>b.id===bookId);
    if(!book)return;
    markDeleted("book",book,date);
    books=books.filter(x=>x.id!==bookId);
    for(const key of Object.keys(localStorage).filter(k=>k.startsWith("vocab_trainer_data_"))){
      const arr=read(key,[]);
      for(const v of arr.filter(x=>x.bookId===bookId))markDeleted("vocab",v,date);
      save(key,arr.filter(x=>x.bookId!==bookId));
    }
    for(const v of specials.filter(x=>x.bookId===bookId))markDeleted("special",v,date);
    for(const v of history.filter(x=>x.bookId===bookId))markDeleted("event",v,date);
    specials=specials.filter(x=>x.bookId!==bookId);
    history=history.filter(x=>x.bookId!==bookId);
    chosenBook=books[0]?.id||"";
    persistMetadata();
    if(chosenBook)chooseBook(chosenBook);
    else {vocabList=[];filteredVocabList=[];get("rangeCard").classList.add("hidden");refreshBookChoices();}
  }
  window.confirmSelectedBookDeletion=function(){
    const book=books.find(b=>b.id===chosenBook);if(!book)return;
    const count=allVocab().filter(x=>x.bookId===book.id).length;
    const msg="Buch „"+book.name+"“ endgültig löschen?\n\n"+
      count+" Vokabeln sowie alle zugehörigen Beispielsätze, KI-Sätze und Lernstatistiken "+
      "werden lokal entfernt und bei der nächsten erfolgreichen Synchronisation auch "+
      "auf anderen verbundenen Geräten gelöscht. Dieser Vorgang kann nur mit einer "+
      "vorher exportierten Datensicherung rückgängig gemacht werden.";
    if(!confirm(msg))return;
    removeBookLocally(book.id,new Date().toISOString());
  };
  function chooseBook(bookId, refresh=true){
    const book=books.find(b=>b.id===bookId);if(!book)return;
    chosenBook=book.id;
    localStorage.setItem(STORE+"_book",book.id);
    if(book.lang){get("targetLang").value=book.lang;localStorage.setItem("vocab_trainer_current_lang",book.lang);}
    if(refresh) loadFromLocalStorage();
    refreshBookChoices();
  }
  function addBook(lang,name){
    if(!name?.trim())return null;
    const b={id:id(),name:name.trim(),lang:lang||"",updatedAt:new Date().toISOString()};
    books.push(b);persistMetadata();refreshBookChoices();return b;
  }
  window.openBookPicker=function(source){
    if(!navigator.onLine){get("scanStatus").textContent="Kamera und Galerie sind für neue Scans nur online verfügbar.";return;}
    const modal=get("bookPicker");
    const dropdown=get("pickerBook");
    dropdown.innerHTML="";
    books.forEach(b=>dropdown.add(new Option(bookText(b),b.id)));
    dropdown.add(new Option("＋ Neues Buch anlegen","__new__"));
    dropdown.value=chosenBook||"__new__";
    get("pickerNewName").value="Muster";
    get("pickerNewFields").hidden=dropdown.value!=="__new__";
    dropdown.onchange=()=>get("pickerNewFields").hidden=dropdown.value!=="__new__";
    chosenForScan=source;
    modal.showModal();
  };
  window.commitBookPicker=function(){
    const dropdown=get("pickerBook");
    let b=books.find(b=>b.id===dropdown.value);
    if(dropdown.value==="__new__"){
      const name=get("pickerNewName").value.trim();
      if(!name)return alert("Bitte einen Buchnamen eingeben.");
      b=addBook("",name);
    }
    if(!b)return;
    chooseBook(b.id);
    get("bookPicker").close();
    get(chosenForScan==="camera"?"cameraInput":"galleryInput").click();
  };
  window.acceptScannedLanguage=function(language){
    if(!Object.prototype.hasOwnProperty.call(LANGS,language))throw Error("Unbekannte oder nicht unterstützte Sprache: "+language);
    const b=books.find(x=>x.id===chosenBook);
    if(!b)throw Error("Vor dem Scannen bitte ein Buch auswählen.");
    if(b.lang&&b.lang!==language)throw Error("Buch „"+b.name+"“ enthält bereits "+(LANGS[b.lang]||b.lang)+". Die neu erkannten Seiten sind "+LANGS[language]+". Bitte ein eigenes Buch anlegen.");
    if(!b.lang){b.lang=language;b.updatedAt=new Date().toISOString();persistMetadata();}
    get("targetLang").value=language;
    localStorage.setItem("vocab_trainer_current_lang",language);
    loadFromLocalStorage();
    refreshBookChoices();
  };
  window.ingestConjugations=function(conjugations,language){
    if(!Array.isArray(conjugations)||conjugations.length===0)return 0;
    const origin=books.find(b=>b.id===chosenBook);
    if(!origin)throw Error("Kein Quellbuch für Konjugationen ausgewählt.");
    const sourceBookId=origin.id;
    const name=origin.name+" – Konjugationen";
    let conjBook=books.find(b=>b.sourceBookId===sourceBookId&&b.kind==="conjugations");
    const persons=new Set(["je","j'","tu","il/elle/on","nous","vous","ils/elles"]);
    const items=[];
    for(const group of conjugations){
      if(!group||!Array.isArray(group.forms)||!String(group.infinitive||"").trim())continue;
      const tense=String(group.tense||"").trim();
      if(!tense)continue;
      for(const form of group.forms){
        const person=String(form.person||"").trim().toLowerCase();
        const foreign=String(form.foreign||"").trim();
        const german=String(form.german||"").trim();
        if(!persons.has(person)||!foreign||!german)continue;
        items.push({bookId:"",lang:language,kind:"conjugation",
          page:String(group.page||"?"),foreign,german,
          infinitive:String(group.infinitive).trim(),tense,person,
          sentence_foreign:"",sentence_german:""});
      }
    }
    if(!items.length)return 0;
    if(!conjBook){
      conjBook=addBook(language,name);
      conjBook.sourceBookId=sourceBookId;
      conjBook.kind="conjugations";
      persistMetadata();
    }
    const count=mergeVocabularies(items.map(item=>({...item,bookId:conjBook.id})));
    saveToLocalStorage();
    chooseBook(sourceBookId);
    return count;
  };
  window.pickLearningBook=function(){chooseBook(get("bookSelect").value)};

  const oldLoad=loadFromLocalStorage;
  loadFromLocalStorage=function(){
    oldLoad();
    refreshBookChoices();
    initPageInputAndSelectors();
  };
  updateScannedPagesUI=function(){renderBooks()};
  initPageInputAndSelectors=function(){
    const book=books.find(b=>b.id===chosenBook);
    if(!book)return;
    const target=vocabList.filter(v=>v.bookId===book.id);
    get("pageRangeInput").value=formatPageRanges([...new Set(target.map(x=>Number(x.page)).filter(Number.isFinite))].sort((a,b)=>a-b));
    filterVocabByPages();
    get("rangeCard").classList.toggle("hidden",target.length===0);
  };
  filterVocabByPages=function(){
    const allowed=parsePageRanges(get("pageRangeInput").value);
    const bookOnly=vocabList.filter(v=>v.bookId===chosenBook);
    filteredVocabList=(!get("pageRangeInput").value.trim()||!allowed.length)?bookOnly:
      bookOnly.filter(v=>allowed.includes(parseInt(v.page)));
    populateSelectors();
  };
  const oldSave=saveToLocalStorage;
  saveToLocalStorage=function(){
    vocabList.forEach(v=>{
      if(!v.id)v.id=id();
      if(!v.bookId)v.bookId=chosenBook;
      if(!v.updatedAt)v.updatedAt=new Date().toISOString();
    });
    oldSave();scheduleSync();
  };
  const oldOnLang=onLanguageChange;
  onLanguageChange=function(){
    oldOnLang();
    const b=books.find(x=>x.lang===get("targetLang").value);
    if(b)chooseBook(b.id);
  };
  const oldMerge=mergeVocabularies;
  mergeVocabularies=function(incoming){
    const tagged=incoming.map(v=>({...v,bookId:v.bookId||chosenBook,id:v.id||id(),updatedAt:v.updatedAt||new Date().toISOString()}));
    
    // Avoid mixing different books that happen to contain identical words and page numbers.
    const filtered=tagged.filter(v=>!vocabList.some(x=>x.bookId===v.bookId&&String(x.page)===String(v.page)&&
      String(x.foreign).trim().toLowerCase()===String(v.foreign).trim().toLowerCase()&&
      String(x.german).trim().toLowerCase()===String(v.german).trim().toLowerCase()&&
      (v.kind!=="conjugation"||String(x.tense||"")===String(v.tense||""))));
    const count=oldMerge(filtered);
    vocabList.forEach(v=>{if(!v.id)v.id=id();if(!v.bookId)v.bookId=chosenBook;});
    return count;
  };
  const oldFile=handleFileInput;
  handleFileInput=async function(e){await oldFile(e);await tempImages(rawImages);};
  // Existing event listeners were bound before this extension; rebind using capture
  // so the images are persisted after their asynchronous read completes.
  ["cameraInput","galleryInput"].forEach(name=>{
    const input=get(name);
    input.removeEventListener("change",oldFile);
    input.addEventListener("change",handleFileInput);
  });
  const oldRemove=removeImage;
  removeImage=function(index){oldRemove(index);tempImages(rawImages);};
  const oldAnalyze=analyzePages;
  analyzePages=async function(){
    if(!navigator.onLine)return;
    analysisInterrupted=false;updateOnlineState();
    try{
      await oldAnalyze();
      if(!rawImages.length){await tempImages([]);analysisInterrupted=false;}
      else if(!navigator.onLine)analysisInterrupted=true;
    }finally{updateOnlineState();}
  };
  const oldRender=renderGallery;
  renderGallery=function(){oldRender();updateOnlineState();};

  function updateOnlineState(){
    const online=navigator.onLine;
    for(const key of ["cameraInput","galleryInput"]){get(key).disabled=!online;}
    for(const key of ["cameraPickerBtn","galleryPickerBtn"]){get(key).disabled=!online;}
    const btn=get("analyzeBtn");if(btn){
      btn.disabled=!online;
      if(!online&&rawImages.length){analysisInterrupted=true;btn.textContent="Analyse abgebrochen – Offline";}
      else if(analysisInterrupted&&rawImages.length)btn.textContent="Analyse kann fortgesetzt werden";
      else if(!rawImages.length)btn.textContent="Seiten analysieren & Vokabeln laden";
    }
    renderStatus();
  }
  window.addEventListener("online",updateOnlineState);
  window.addEventListener("offline",updateOnlineState);

  // Keep full printed spelling, but exclude metadata and phonetics from spoken text.
  window.safeUnderline=function(value){
    return String(value||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/&lt;u&gt;/gi,"<u>").replace(/&lt;\/u&gt;/gi,"</u>");
  };
  window.cleanSpokenText=function(text){
    return String(text||"").replace(/<[^>]*>/g,"")
      .replace(/\[[^\]]*\]/g,"")
      .replace(/\((?:AE|BE|AmE|BrE|UK|US|American English|British English|ugs\.?|fig\.?|pl\.?|sing\.?)\)/gi,"")
      .replace(/\b(?:AE|BE|AmE|BrE)\s*:/g,"")
      .replace(/\s+/g," ").trim();
  };
  function speakingVariants(raw,lang){
    const text=String(raw||"").replace(/<[^>]*>/g,"");
    if(!/^en-/i.test(lang)||!/(?:\bAE\b|\bBE\b|\bAmE\b|\bBrE\b)/.test(text))
      return [{text:cleanSpokenText(raw),lang}];
    const pieces=text.split(/\s*[;,]\s*/).filter(Boolean);
    const variants=pieces.map(piece=>{
      const prefix=piece.match(/^\s*(AE|BE|AmE|BrE)\s*:?\s*(.+)$/i);
      const suffix=piece.match(/^(.+?)\s*\((AE|BE|AmE|BrE)\)\s*$/i);
      const mark=prefix?.[1]||suffix?.[2];
      const value=prefix?.[2]||suffix?.[1];
      if(!mark||!value)return null;
      return {text:cleanSpokenText(value),lang:/^(AE|AmE)$/i.test(mark)?"en-US":"en-GB"};
    });
    if(variants.length>0&&variants.every(Boolean))return variants;
    return [{text:cleanSpokenText(raw),lang}];
  }
  playAudio=function(type){
    const item=trainingItems[currentIndex];if(!item)return;
    const raw=type==="prompt"?item.prompt:item.target;
    const lang=type==="prompt"?item.pLang:item.tLang;
    const variants=speakingVariants(raw,lang).filter(x=>x.text);
    speechSynthesis.cancel();
    function speakIndex(index){
      if(index>=variants.length)return;
      const current=variants[index],utterance=new SpeechSynthesisUtterance(current.text);
      utterance.lang=current.lang;utterance.rate=current.lang==="de-DE"?1:0.85;
      utterance.onend=()=>speakIndex(index+1);
      utterance.onerror=()=>speakIndex(index+1);
      speechSynthesis.speak(utterance);
    }
    speakIndex(0);
    if(type==="target"&&lastShownEvent)logEvent("spoken",item);
  };
  const originalRecognition=startSpeechRecognition;
  startSpeechRecognition=function(){
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SpeechRecognition){alert("Spracherkennung hier nicht verfügbar.");return;}
    const recognition=new SpeechRecognition();
    recognition.lang=trainingItems[currentIndex]?.tLang||get("targetLang").value;
    recognition.onresult=e=>{
      get("answerInput").value=e.results[0][0].transcript;
      get("answerInput").focus();
    };
    recognition.onerror=e=>get("answerFeedback").textContent="Spracherkennung: "+e.error;
    recognition.start();
  };
  function logEvent(action,item,other={}){
    const entry={id:id(),bookId:item.bookId||chosenBook,
      page:String(item.page||"?"),pages:(item.pages?.length?item.pages:[item.page||"?"]).map(String),kind:item.kind||"words",
      sourceId:item.sourceId||item.ref||"",at:new Date().toISOString(),
      action,...other};
    history.push(entry);save(STORE+"_events",history);scheduleSync();
    return entry;
  }
  const oldShow=showCard;
  showCard=function(){
    oldShow();
    analyzedThisCard=false;
    const input=get("answerInput"),feedback=get("answerFeedback");
    input.value="";input.className="";feedback.textContent="";
    const item=trainingItems[currentIndex];
    lastShownEvent=logEvent("shown",item);
    document.body.classList.add("voc-training-active");
    if(window.matchMedia("(min-width: 641px) and (pointer: fine)").matches)setTimeout(()=>input.focus(),0);
  };
  function simplified(text){
    return cleanSpokenText(text).normalize("NFKC").toLocaleLowerCase()
      .replace(/[.!?,;:]/g,"").replace(/\s+/g," ").trim();
  }
  window.checkTypedAnswer=function(e){
    if(e.key!=="Enter"||e.isComposing)return;
    e.preventDefault();
    if(analyzedThisCard||!get("answerInput").value.trim()){nextCard();return;}
    window.gradeCurrentAnswer();
  };
  window.gradeCurrentAnswer=function(){
    if(analyzedThisCard)return;
    const input=get("answerInput"),item=trainingItems[currentIndex];
    const given=input.value.trim();
    if(!given)return;
    const alternatives=String(item.target||"").split(/\s*(?:\/|;|\bor\b)\s*/i);
    const correct=alternatives.some(s=>simplified(s)===simplified(given));
    analyzedThisCard=true;
    input.className=correct?"answer-correct":"answer-wrong";
    get("answerFeedback").textContent=correct?"Richtig":"Nicht richtig – Lösung aufgedeckt";
    get("targetText").classList.remove("masked");
    logEvent("graded",item,{correct,answer:given});
  };
  window.advanceOrGrade=function(){
    const input=get("answerInput");
    if(!analyzedThisCard&&input.value.trim()){window.gradeCurrentAnswer();return;}
    nextCard();
  };
  const originalNextCard=nextCard;
  nextCard=function(){
    if(!analyzedThisCard&&get("answerInput").value.trim()){
      window.gradeCurrentAnswer();
      return;
    }
    originalNextCard();
  };
  const originalExitTrainer=exitTrainer;
  exitTrainer=function(){
    originalExitTrainer();
    document.body.classList.remove("voc-training-active");
  };
  // Original nextCard and prevCard invoke showCard, which logs every displayed question.
  const oldStart=startTraining;
  startTraining=async function(e){
    if(get("bookSelect")?.value)chooseBook(get("bookSelect").value);
    // Avoid original implicit window.event bug for Gemini mix button.
    await oldStart(e);
  };
  const oldGenerate=generateAllCombinedSentences;
  generateAllCombinedSentences=async function(slice,btn,label,random){
    const key=JSON.stringify(slice.map(v=>v.id||v.refVocab));
    let cached=specials.find(x=>x.bookId===chosenBook&&x.key===key);
    if(!navigator.onLine){
      if(!cached)throw Error("KI-Mix wurde noch nicht gespeichert; Internet nötig.");
      trainingItems=cached.items.map(x=>({...x}));
      if(random)trainingItems.sort(()=>Math.random()-0.5);
      btn.innerText=label;btn.disabled=false;
      enterTraining();return;
    }
    await oldGenerate(slice,btn,label,random);
    const page=String(slice[0]?.page||"?");
    trainingItems=trainingItems.map(x=>({...x,bookId:chosenBook,page:x.page||page,kind:"special",sourceId:x.ref||id()}));
    if(!cached) {
      cached={id:id(),bookId:chosenBook,key,page,items:trainingItems,updatedAt:new Date().toISOString()};
      specials.push(cached);
    } else {cached.items=trainingItems;cached.updatedAt=new Date().toISOString();}
    persistMetadata();
  };
  function enterTraining(){
    currentIndex=0;
    for(const n of ["configCard","scanCard","rangeCard"])get(n).classList.add("hidden");
    get("trainerCard").classList.remove("hidden");showCard();
  }
  const oldExport=exportDataToFile;
  exportDataToFile=function(){
    const anonymousEvents=history.map(({profile,...event})=>event);
    const data={schemaVersion:2,exportedAt:new Date().toISOString(),
      books, vocabulary:allVocab(),specialSentences:specials,
      practiceEvents:anonymousEvents,deletedRecords:tombstones};
    const file=new Blob([JSON.stringify(data,null,2)],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(file),a=document.createElement("a");
    const d=new Date(),pad=n=>String(n).padStart(2,"0");
    a.href=url;a.download=String(d.getFullYear()).slice(-2)+pad(d.getMonth()+1)+pad(d.getDate())+"_vokabeln.txt";
    a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  importDataFromFile=function(ev){
    const file=ev.target.files?.[0];if(!file)return;
    file.text().then(text=>{
      const data=JSON.parse(text);
      if(Array.isArray(data)){
        const lang=get("targetLang").value;
        let book=books.find(b=>b.lang===lang);
        if(!book)book=addBook(lang,"Muster");
        chooseBook(book.id);
        const n=mergeVocabularies(data);saveToLocalStorage();refreshBookChoices();
        alert(n+" Vokabeln aus älterem Backup importiert.");return;
      }
      if(data?.schemaVersion!==2||!Array.isArray(data.books)||!Array.isArray(data.vocabulary))throw Error("Unbekanntes Backupformat");
      const known=new Set(books.map(b=>b.id));
      for(const b of data.books){if(!known.has(b.id)){books.push(b);known.add(b.id);}}
      for(const v of data.vocabulary){
        const k="vocab_trainer_data_"+v.lang;
        const arr=read(k,[]);
        if(!arr.some(x=>x.id===v.id))arr.push(v);
        save(k,arr);
      }
      const specialIds=new Set(specials.map(x=>x.id));
      for(const x of data.specialSentences||[])if(!specialIds.has(x.id))specials.push(x);
      const eventIds=new Set(history.map(x=>x.id));
      for(const x of data.practiceEvents||[])if(!eventIds.has(x.id))history.push(x);
      for(const t of data.deletedRecords||[]){
        if(!t.record_id||!t.payload?.deleted)continue;
        if(!tombstones.some(x=>x.record_id===t.record_id))tombstones.push(t);
      }
      persistMetadata();chooseBook(chosenBook);alert("Vollständige Sicherung eingelesen.");
    }).catch(e=>alert("Import fehlgeschlagen: "+e.message)).finally(()=>{ev.target.value="";});
  };
  clearCurrentLangData=function(){
    alert("Bitte zum Löschen das rote X beim gewünschten Buch verwenden.");
  };

  window.showLearningAnalysis=function(){
    const container=get("analysisContent");container.innerHTML="";
    const events=history;
    const grades=events.filter(x=>x.action==="graded");
    const right=grades.filter(x=>x.correct).length;
    const intro=document.createElement("p");
    intro.textContent=events.filter(x=>x.action==="shown").length+
      " Abfragen · "+grades.length+" bewertete Antworten · "+(grades.length?Math.round(right/grades.length*100):0)+" % richtig";
    container.append(intro);
    for(const b of books){
      const heading=document.createElement("h3");heading.textContent=b.name+" ("+(LANGS[b.lang]||b.lang)+")";container.append(heading);
      for(const [kind,title] of [["words","Vokabeln"],["sentences","Einfache Sätze"],["special","KI-Spezialsätze"]]){
        const h=document.createElement("h4");h.textContent=title;container.append(h);
        const rows=events.filter(x=>x.bookId===b.id&&x.kind===kind);
        const pages=[...new Set(rows.flatMap(x=>x.pages||[x.page]).concat(allVocab().filter(x=>x.bookId===b.id).map(x=>String(x.page))))].sort((a,z)=>Number(a)-Number(z));
        const chart=document.createElement("div");chart.className="histogram";
        if(!pages.length)chart.textContent="Noch keine Daten.";
        const max=Math.max(1,...pages.map(p=>rows.filter(e=>e.page===p).length));
        for(const p of pages){
          const asked=rows.filter(e=>(e.pages||[e.page]).includes(p)&&e.action==="shown").length;
          const spoken=rows.filter(e=>(e.pages||[e.page]).includes(p)&&e.action==="spoken").length;
          const pair=document.createElement("div");pair.className="histogram-pair";
          const bars=document.createElement("div");bars.className="histogram-bars";
          for(const [n,klass] of [[asked,"asked"],[spoken,"spoken"]]){
            const bar=document.createElement("div");bar.className=klass;
            bar.style.height=(Math.max(2,n/max*100))+"%";bar.title=n+" "+klass;
            bars.append(bar);
          }
          const label=document.createElement("small");label.textContent=p;
          pair.append(bars,label);chart.append(pair);
        }
        container.append(chart);
      }
    }
    const errors=new Map();
    for(const x of grades.filter(x=>!x.correct)){
      const k=x.bookId+"|"+x.sourceId,prev=errors.get(k)||{item:x,count:0};
      prev.count++;errors.set(k,prev);
    }
    const h=document.createElement("h3");h.textContent="Mindestens einmal falsch beantwortet";container.append(h);
    const list=document.createElement("ul");
    [...errors.values()].sort((a,b)=>b.count-a.count).forEach(x=>{
      const li=document.createElement("li");
      const vocabulary=allVocab().find(v=>v.id===x.item.sourceId);
      li.textContent=(vocabulary?.foreign||x.item.sourceId)+" – "+x.count+" Fehler";
      list.append(li);
    });
    if(!errors.size)list.textContent="Noch keine falsch bewerteten Antworten.";
    container.append(list);
    get("analysisDialog").showModal();
  };

  function records(){
    const items=[];
    for(const b of books)items.push({record_id:"book:"+b.id,record_type:"book",payload:b,updated_at:b.updatedAt});
    for(const v of allVocab())items.push({record_id:"vocab:"+v.id,record_type:"vocab",payload:v,updated_at:v.updatedAt});
    for(const x of specials)items.push({record_id:"special:"+x.id,record_type:"special",payload:x,updated_at:x.updatedAt});
    for(const x of history){
      const {profile, ...publicEvent}=x;
      items.push({record_id:"event:"+x.id,record_type:"event",payload:publicEvent,updated_at:x.at});
    }
    for(const t of tombstones)items.push(t);
    return items;
  }
  const newer=(left,right)=>Date.parse(left||0)>Date.parse(right||0);
  function mergeRemote(rows){
    const local=new Map(records().map(x=>[x.record_id,x]));
    let changed=false;
    for(const row of rows){
      const old=local.get(row.record_id);
      if(old&&!newer(row.updated_at,old.updated_at))continue;
      const payload=row.payload;
      if(payload?.deleted===true){
        const oldDelete=tombstones.find(t=>t.record_id===row.record_id);
        if(!oldDelete||newer(row.updated_at,oldDelete.updated_at)){
          tombstones=tombstones.filter(t=>t.record_id!==row.record_id);
          tombstones.push(row);
        }
        if(row.record_type==="book"){
          books=books.filter(b=>b.id!==payload.id);
        }else if(row.record_type==="vocab"){
          for(const key of Object.keys(localStorage).filter(k=>k.startsWith("vocab_trainer_data_"))){
            save(key,read(key,[]).filter(x=>x.id!==payload.id));
          }
        }else if(row.record_type==="special"){
          specials=specials.filter(x=>x.id!==payload.id);
        }else if(row.record_type==="event"){
          history=history.filter(x=>x.id!==payload.id);
        }
        changed=true;
        continue;
      }
      const deletedBookIds=new Set(tombstones.filter(t=>t.record_type==="book").map(t=>t.payload.id));
      if(deletedBookIds.has(payload.bookId)||deletedBookIds.has(payload.id))continue;
      if(row.record_type==="book"){
        const i=books.findIndex(x=>x.id===payload.id);
        if(i>=0)books[i]=payload;else books.push(payload);
      }else if(row.record_type==="vocab"){
        const k="vocab_trainer_data_"+payload.lang;
        const arr=read(k,[]);
        const i=arr.findIndex(x=>x.id===payload.id);
        if(i>=0)arr[i]=payload;else arr.push(payload);
        save(k,arr);
      }else if(row.record_type==="special"){
        const i=specials.findIndex(x=>x.id===payload.id);
        if(i>=0)specials[i]=payload;else specials.push(payload);
      }else if(row.record_type==="event"){
        if(!history.some(x=>x.id===payload.id))history.push(payload);
      }
      changed=true;
    }
    if(changed){
      save(STORE+"_books",books);save(STORE+"_special",specials);
      save(STORE+"_events",history);save(STORE+"_tombstones",tombstones);
      if(!books.some(b=>b.id===chosenBook))chosenBook=books[0]?.id||"";
      if(chosenBook)chooseBook(chosenBook);
      else {vocabList=[];filteredVocabList=[];get("rangeCard").classList.add("hidden");refreshBookChoices();}
    }
  }
  async function publicFetch(path,options={}){
    return fetch(DB_URL+path,{...options,headers:{
      "apikey":PUB_KEY,"Content-Type":"application/json",...(options.headers||{})
    }});
  }
  window.syncVocprog=syncNow;
  let lastError="";
  async function syncNow(){
    if(syncing||!navigator.onLine)return;
    syncing=true;renderStatus();
    try{
      const table="/rest/v1/vocprog_public_records";
      let res=await publicFetch(table+"?select=record_id,record_type,payload,updated_at&limit=10000");
      if(!res.ok)throw Error("Öffentliche Tabelle noch nicht eingerichtet (HTTP "+res.status+").");
      const remote=await res.json();
      if(!Array.isArray(remote))throw Error("Ungültige Datenbankantwort.");
      if(remote.length>=10000)throw Error("Datensatzgrenze erreicht – Paging erforderlich.");
      mergeRemote(remote);
      const server=new Map(remote.map(x=>[x.record_id,x]));
      const outgoing=records().filter(x=>!server.has(x.record_id)||
        newer(x.updated_at,server.get(x.record_id).updated_at));
      for(let i=0;i<outgoing.length;i+=100){
        res=await publicFetch(table+"?on_conflict=record_id",{
          method:"POST",headers:{"Prefer":"resolution=merge-duplicates,return=minimal"},
          body:JSON.stringify(outgoing.slice(i,i+100))
        });
        if(!res.ok)throw Error("Öffentlicher Schreibzugriff nicht eingerichtet (HTTP "+res.status+").");
      }
      lastSync=new Date().toISOString();localStorage.setItem(STORE+"_synced",lastSync);lastError="";
    }catch(e){lastError=e.message;console.warn("VOC Sync:",e);}
    finally{syncing=false;renderStatus();}
  }
  function scheduleSync(){
    clearTimeout(syncTimer);
    if(navigator.onLine)syncTimer=setTimeout(syncNow,1300);
  }
  function renderStatus(){
    const time=lastSync?new Date(lastSync):null;
    const stamp=time&&!isNaN(time.getTime())?
      new Intl.DateTimeFormat("de-DE",{
        day:"2-digit",month:"2-digit",year:"2-digit",
        hour:"2-digit",minute:"2-digit",hour12:false
      }).format(time):"–";
    get("connectionStatus").textContent=(navigator.onLine?"Online":"Offline")+
      " · Sync "+stamp+(lastError?" · "+lastError:syncing?" · Sync läuft":"");
  }
  function onReady(){
    document.body.classList.remove("voc-training-active");
    localStorage.removeItem(STORE+"_auth");
    localStorage.removeItem(STORE+"_profile");
    history=history.map(({profile,...event})=>event);
    save(STORE+"_events",history);
    ensureMigration();
    if(chosenBook)chooseBook(chosenBook);else refreshBookChoices();
    updateOnlineState();
    tempImages().then(images=>{
      if(Array.isArray(images)&&images.length&&!rawImages.length){
        rawImages=images;renderGallery();get("scanStatus").textContent="Nicht analysierte Scanbilder wiederhergestellt.";
      }
      scanQueueReady=true;
    });
    if("serviceWorker" in navigator&&location.protocol==="https:"){
      navigator.serviceWorker.register("./sw.js").catch(e=>console.warn("SW registration failed",e));
    }
    syncNow();
    setInterval(()=>{if(navigator.onLine)syncNow();},15*60*1000);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",onReady);
  else onReady();
})();
