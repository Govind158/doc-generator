function loadContent() {
  filteredLanguageList1();
  }

// async function filteredLanguageList(){
//   let unfilteredLanguage_set = [];
//   let language_set = [];
//   try{
//     let response = await fetch('./index.json');
//     let docList = await response.json();
//     for (let i = 0; i < docList.commands.length; i++) {
//       for (let j = 0; j < docList.commands[i].language.length; j++){
//         unfilteredLanguage_set.push(docList.commands[i].language[j]);
//       }
//     }
//     language_set = removeDuplicates(unfilteredLanguage_set);
//     return language_set;
//   }
//   catch{
//     alert('error');
//   }
// }

function removeDuplicates(languageArray) {
  return languageArray.filter((item,
      index) => languageArray.indexOf(item) === index);
}

  function filteredLanguageList1(){
  let unfilteredLanguage_set = [];
  let language_set = [];
  contentLangSet ={};
  let docList = {};
  fetch('./index.json').then(response => {
    return response.json();
  }).then(data => {
    for (let i = 0; i < data.commands.length; i++) {
      for (let j = 0; j < data.commands[i].language.length; j++){
        unfilteredLanguage_set.push(data.commands[i].language[j]);
      }
    }
  let docuLength = data.commands.length;
  language_set = removeDuplicates(unfilteredLanguage_set);
  for (let i = 0; i < language_set.length; i++) {
    for (let j = 0; j < docuLength; j++) {
      for(let k = 0; k < data.commands[j].targets.length; k++){
        if(data.commands[j].targets[k].language ===  language_set[i]){
          contentLangSet[i].language = language_set[i];
          contentLangSet[i].targets.platform = data.commands[j].targets[k].platform;
          contentLangSet[i].targets.title = data.commands[j].name;
          docList.push(contentLangSet[i])
        }
      }
      console.log(docList);
      // console.log(data.commands[j].target);
    }
  }
  });
}


