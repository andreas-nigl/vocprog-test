(function(root){
  "use strict";
  function create(items){
    const initialCount=items.length,answers=new Map(),shown=new Set();
    let spoken=0;
    return {items,answers,shown,initialCount,
      grade(index,correct,answer){
        if(!items[index]||answers.has(index))return false;
        answers.set(index,{correct,answer});
        if(!correct)items.push({...items[index]});
        return true;
      },
      progress(index){
        const correct=[...answers.values()].filter(answer=>answer.correct).length;
        return {current:Math.min(initialCount,correct+(answers.get(index)?.correct?0:1)),total:initialCount};
      },
      speak(){spoken++;},
      complete(){return initialCount>0&&answers.size===items.length;},
      statistics(){
        const asked=answers.size,correct=[...answers.values()].filter(a=>a.correct).length;
        return {initialCount,asked,correct,spoken,percent:asked?100*correct/asked:0};
      }
    };
  }
  const api={create};root.VOCPractice=api;
  if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
