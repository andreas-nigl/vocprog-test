/* German learning equivalents. Tense correspondence is explicit, not contextual translation. */
(function(root){
  'use strict';
  const MAP={
    'fr-FR':{'présent':'präsens','imparfait':'präteritum','passé composé':'perfekt',
      'plus-que-parfait':'plusquamperfekt','futur simple':'futur i','conditionnel présent':'würde-form',
      'subjonctif présent':'dass-präsens'},
    'en-US':{'simple present':'präsens','present progressive':'präsens','simple past':'präteritum',
      'past progressive':'präteritum','present perfect':'perfekt','past perfect':'plusquamperfekt',
      'will future':'futur i','going to future':'futur i','conditional':'würde-form'},
    'es-ES':{'presente':'präsens','pretérito perfecto compuesto':'perfekt','pretérito indefinido':'präteritum',
      'pretérito imperfecto':'präteritum','pluscuamperfecto':'plusquamperfekt','futuro simple':'futur i',
      'condicional simple':'würde-form','presente de subjuntivo':'dass-präsens'},
    'pt-PT':{'presente':'präsens','pretérito perfeito':'präteritum','pretérito imperfeito':'präteritum',
      'mais-que-perfeito composto':'plusquamperfekt','futuro do presente':'futur i',
      'condicional':'würde-form','presente do conjuntivo':'dass-präsens'},
    'nl-NL':{'onvoltooid tegenwoordige tijd':'präsens','onvoltooid verleden tijd':'präteritum',
      'voltooid tegenwoordige tijd':'perfekt','voltooid verleden tijd':'plusquamperfekt','onvoltooid toekomende tijd':'futur i'}
  };
  const PEOPLE=[['ich'],['du'],['er','sie','es'],['wir'],['ihr'],['sie']];
  const normal=value=>String(value||'').normalize('NFC').trim().toLocaleLowerCase().replace(/\s+/g,' ');
  const contains=(slot,form)=>Array.isArray(slot)&&slot.some(value=>normal(value)===normal(form));
  const six=value=>Array.isArray(value)&&value.length===6&&value.every(Boolean);
  function candidates(text){
    return [...new Set(String(text||'').split(/[,;]/).map(value=>value.trim()).filter(Boolean))].slice(0,8);
  }
  function parseMeaning(text,morphology){
    const direct=text.includes(' ')?null:morphology(text,'de-DE');
    if(direct)return {lemma:text,complement:'',table:direct};
    if(!['nach Hause gehen','Erfolg haben'].includes(text))return null;
    const words=text.split(/\s+/),lemma=words.pop();
    if(!lemma||words.length>6)return null;
    const table=morphology(lemma,'de-DE');
    // Phrase complements are retained, not silently discarded.
    if(!table||words.some(word=>/[<>]/.test(word))||words[0]==='sich')return null;
    return {lemma,complement:words.join(' '),table};
  }
  async function verifiedGerman(meaning,lookup){
    const ref=await lookup('de-DE',meaning.lemma);
    if(!ref)return null;
    const table=meaning.table;
    const forms={},corrections=[];
    function verifiedRow(name,key){
      const row=ref.forms[key];
      if(!Array.isArray(row)||row.length!==6||row.some(slot=>!Array.isArray(slot)||!slot.length))return null;
      const generated=table.forms[name];
      const result=row.map((slot,index)=>contains(slot,generated?.[index])?generated[index]:slot[0]);
      if(!six(generated)||result.some((value,index)=>value!==generated[index]))corrections.push(name);
      return result;
    }
    for(const [tense,key] of [['präsens','present'],['präteritum','preterite']]){
      const row=verifiedRow(tense,key);if(row)forms[tense]=row;
    }
    const participle=ref.participle?.find(value=>normal(value)===normal(table.participle))||ref.participle?.[0];
    const choices=ref.auxiliaries||[ref.auxiliary];
    const auxiliary=choices.includes(table.auxiliary)?table.auxiliary:choices.find(Boolean);
    const aux=auxiliary?await lookup('de-DE',auxiliary):null;
    for(const [tense,key,auxTense] of [['perfekt','perfect','present'],['plusquamperfekt','pluperfect','preterite']]){
      const direct=verifiedRow(tense,key);
      if(direct){forms[tense]=direct;continue;}
      if(participle&&aux?.forms[auxTense]?.length===6&&aux.forms[auxTense].every(slot=>slot?.length))
        forms[tense]=aux.forms[auxTense].map(slot=>slot[0]+' '+participle);
    }
    const werden=await lookup('de-DE','werden');
    for(const [tense,auxTense] of [['futur i','present'],['würde-form','konjunktiv2']]){
      const direct=tense==='futur i'?verifiedRow(tense,'future1'):null;
      if(direct){forms[tense]=direct;continue;}
      if(werden?.forms[auxTense]?.length===6&&werden.forms[auxTense].every(slot=>slot?.length))
        forms[tense]=werden.forms[auxTense].map(slot=>slot[0]+' '+meaning.lemma);
    }
    return {...meaning,forms,corrections,participle,imperative:ref.imperative,
      sources:[...(ref.sources||[]),...(aux?.sources||[]),...(werden?.sources||[])]};
  }
  function sentence(meaning,tense,index,person){
    const subordinate=tense==='dass-präsens';
    const bare=meaning.forms[subordinate?'präsens':tense]?.[index];
    if(!bare)return null;
    const words=bare.split(' '),finite=words.shift(),rest=words.join(' ');
    if(subordinate){
      // In simple German subordinate clauses separable particles rejoin the finite verb.
      return ['dass',person,meaning.complement,rest+finite].filter(Boolean).join(' ');
    }
    return [person,finite,meaning.complement,rest].filter(Boolean).join(' ');
  }
  function targets(language,index){
    let list=PEOPLE[index].map(person=>({person,index}));
    if(language==='fr-FR'&&index===2)list=['er','sie','man'].map(person=>({person,index}));
    if(language==='fr-FR'&&index===4)list.push({person:'Sie',index:5});
    if(language==='es-ES'&&index===2)list.push({person:'Sie',index:5});
    if(language==='en-US'&&(index===1||index===4))list=[{person:'du',index:1},{person:'ihr',index:4},{person:'Sie',index:5}];
    return list;
  }
  async function translate(verb,language,morphology,lookup){
    const meanings=[];
    for(const candidate of candidates(verb.german)){
      const parsed=parseMeaning(candidate,morphology);
      if(!parsed)continue;
      const verified=await verifiedGerman(parsed,lookup);
      if(verified)meanings.push(verified);
    }
    const evidence=[...new Map(meanings.flatMap(value=>value.sources||[]).filter(Boolean).map(value=>[value.url,value])).values()];
    for(const [tense,cards] of Object.entries(verb.cards)){
      const germanTense=MAP[language]?.[tense];
      for(let index=0;index<cards.length;index++){
        const card=cards[index],answers=[];
        for(const meaning of meanings)for(const target of targets(language,index)){
          const text=sentence(meaning,germanTense,target.index,target.person);
          if(text)answers.push(text);
        }
        card.acceptedGerman=[...new Set(answers)];
        if(answers.length){
          const saved=card.german;
          card.german=answers.some(value=>normal(value)===normal(saved))?saved:
            meanings.flatMap(meaning=>{
              const groups=new Map();
              for(const target of targets(language,index)){
                if(!groups.has(target.index))groups.set(target.index,[]);groups.get(target.index).push(target.person);
              }
              return [...groups].map(([slot,people])=>sentence(meaning,germanTense,slot,people.join('/')));
            }).filter(Boolean).join(' / ');
          card.acceptedGerman.push(card.german);
          card.germanVerification={status:'reference-matched',mapping:'school-equivalent',tense:germanTense,sources:evidence};
        }else{
          card.germanVerification={status:'pending',reason:'Keine vollständig belegte deutsche Lernentsprechung'};
        }
      }
    }
    verb.participleGerman=meanings.filter(value=>value.participle)
      .map(value=>[value.complement,value.participle].filter(Boolean).join(' ')).join(' / ');
    verb.imperativeGerman=meanings.filter(value=>value.imperative?.du&&value.imperative?.wir&&value.imperative?.ihr)
      .map(value=>['du','wir','ihr','Sie'].filter(person=>value.imperative[person]).map(person=>{
        const words=value.imperative[person].split(/\s+/),finite=words.shift();
        const pronoun=['wir','Sie'].includes(person)&&words[0]===person?words.shift():'';
        return '('+person+') '+[finite,pronoun,value.complement,...words].filter(Boolean).join(' ');
      }).join(' / ')).join(' / ');
    verb.germanEngineCorrections=meanings.filter(value=>value.corrections.length).map(value=>({lemma:value.lemma,tenses:value.corrections}));
    verb.translationPolicy='Schulische Zeitformzuordnung; Bedeutung aus dem Buch. Subjonctif ist kontextabhängig.';
    return verb;
  }
  async function referenceRow(source,language,tense,lookup){
    if(source?.forms?.[tense])return {row:source.forms[tense],sources:source.sources};
    const compounds={
      'es-ES':{'pretérito perfecto compuesto':['haber','presente'],
        'pluscuamperfecto':['haber','pretérito imperfecto']},
      'pt-PT':{'mais-que-perfeito composto':['ter','pretérito imperfeito']},
      'en-US':{'present perfect':['have','simple present'],'past perfect':['have','simple past']}
    };
    const spec=compounds[language]?.[tense];
    if(!source||!spec||!source.participle?.length)return {row:null,sources:source?.sources};
    const aux=await lookup(language,spec[0]),row=aux?.forms?.[spec[1]];
    if(!row||row.length!==6||row.some(slot=>!slot?.length))return {row:null,sources:source.sources};
    return {row:row.map(slot=>slot.flatMap(value=>source.participle.map(part=>value+' '+part))),
      sources:[...(source.sources||[]),...(aux.sources||[])]};
  }
  async function enrich(verb,language,morphology,lookup=root.VOCIndependentReference.lookup){
    let source=null;
    try{source=await lookup(language,verb.infinitive);}catch(error){verb.referenceError=String(error.message||error);}
    for(const [tense,cards] of Object.entries(verb.cards)){
      const reference=await referenceRow(source,language,tense,lookup);
      const row=reference.row;
      for(let index=0;index<cards.length;index++){
        const card=cards[index],candidates=row?.[index];
        if(!Array.isArray(candidates)||!candidates.length){
          card.foreignVerification={status:'pending',reason:'Keine unabhängige Referenzform vorhanden'};
          continue;
        }
        const generated=verb.forms[tense][index];
        const normalized=value=>normal(value).replace(/\(e\)|\(s\)/g,'');
        const matches=candidates.some(value=>normalized(value)===normalized(generated));
        if(!matches){
          const form=candidates[0];verb.forms[tense][index]=form;
          card.foreign=language==='fr-FR'?root.VOCVerbDatabase.frenchSurface(tense,verb.persons[index],form):
            verb.persons[index]+' '+form;
          card.acceptedForeign=language==='fr-FR'?root.VOCVerbDatabase.acceptedFrench(tense,index,form,source.auxiliary):[card.foreign];
          card.referenceCorrection={original:generated,replacement:form};
        }
        card.foreignVerification={status:'reference-matched',sources:reference.sources};
      }
    }
    try{await translate(verb,language,morphology,lookup);}
    catch(error){verb.referenceError=String(error.message||error);}
    const evidence=new Map();
    for(const card of Object.values(verb.cards).flat()){
      for(const verification of [card.foreignVerification,card.germanVerification]){
        for(const item of verification?.sources||[])if(item)evidence.set(item.url,item);
        if(verification)delete verification.sources;
      }
    }
    verb.verificationSources=[...evidence.values()];return verb;
  }
  root.VOCGermanForms=Object.freeze({translate,enrich,mapping:MAP});
})(typeof window==='undefined'?globalThis:window);
