function loadContent() {
  filteredContentList();
  let languageNav = "";
  let languages = JSON.parse(localStorage.getItem("language_set"));
  let content = JSON.parse(localStorage.getItem("contentSet"));
  console.log(languages);
  let defaultLanguage = "en";
  for(let i=0; i<languages.length;i++){
    languageNav += `<li class="nav-item my-1 p-2 highlight"><a type="button" id="`+ languages[i] +`" onClick="fetchTitle(this.id)">`+ languages[i] +`</a ></li>`;
  }
  document.getElementById('lang-id').innerHTML = languageNav;
  langBasedDocumentation();
}

function filteredContentList(){
  let unfilteredLanguage_set = [];
  let unfilteredLanguage = "";
  let language_set = [];
  fetch('./index.json').then(response => {
    return response.json();
  }).then(data => {
  let contentSet = [];
  for(let i=0; i < data.commands.length; i++){
    for(let j=0; j < data.commands[i].targets.length; j++){
      data.commands[i].targets[j].name = data.commands[i].name;
      contentSet.push(data.commands[i].targets[j]);
    }
  }

  for(let i = 0; i < contentSet.length; i++){
    unfilteredLanguage = contentSet[i].language;
    unfilteredLanguage_set.push(unfilteredLanguage);
  }
  language_set = removeDuplicates(unfilteredLanguage_set);
  localStorage.setItem("language_set", JSON.stringify(language_set));
  localStorage.setItem("contentSet", JSON.stringify(contentSet));
  });
}

function removeDuplicates(languageArray) {
  return languageArray.filter((item,
      index) => languageArray.indexOf(item) === index);
}

function langBasedDocumentation(language){
  let content = JSON.parse(localStorage.getItem("contentSet"));
  for(let i=0; i<content.length;i++){
    if(content[i].language === language){
      
    }
  }
}