"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const test=require("node:test");
const root=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const js=fs.readFileSync(path.join(root,"vocprog-enhancements.js"),"utf8");

test("Latin is absent from visible language selection and generation catalog",()=>{
  assert.doesNotMatch(html,/<option[^>]*value="la-LA"/);
  assert.doesNotMatch(js,/"la-LA":"Lateinisch"/);
  assert.doesNotMatch(js,/"la-LA":\[\["praesens"/);
});
test("Latin OCR is rejected before any book assignment or data storage",()=>{
  const check=html.indexOf('if(parsedResponse.detected_language_code==="la-LA")');
  const assign=html.indexOf('acceptScannedLanguage(parsedResponse.detected_language_code)');
  const save=html.indexOf('const verbBookSelected=isSelectedVerbBook()');
  assert.ok(check>=0&&assign>check&&save>check);
});
test("Historic Latin books are archived from UI, not erased",()=>{
  assert.match(js,/books\.filter\(b=>b\.lang!=="la-LA"\)/);
  assert.doesNotMatch(js,/removeItem\(["']vocab_trainer_data_la-LA/);
});
