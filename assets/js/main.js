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
  langBasedDocumentation(defaultLanguage);
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
  let platformUnSortedList = [];
  for(let i=0; i<content.length;i++){
    if(content[i].language === language){
      platformUnSortedList.push(content[i].os);
    }
  }
  let platformList = removeDuplicates(platformUnSortedList);
  const selectAccordion  = document.getElementById('sideNavAccordion'); 
  const headFragment = document.createDocumentFragment();
  for(let i=0; i<platformList.length;i++){
      let accordItem = document.createElement('div');
      accordItem.classList.add('accordion-item');
      let accordTitle = document.createElement('h2');
      accordTitle.classList.add('accordion-header');
      accordTitle.setAttribute('id', 'flush-heading'+i);
      const platformButton = document.createElement('button')
      platformButton.classList.add('accordion-button', 'collapsed');
      platformButton.setAttribute('type', 'button');
      platformButton.setAttribute('data-bs-toggle', 'collapse');
      platformButton.setAttribute('data-bs-target', '#'+platformList[i]);
      platformButton.setAttribute('aria-expanded', 'false');
      platformButton.setAttribute('aria-controls', platformList[i]);
      platformButton.textContent = platformList[i];
      accordTitle.appendChild(platformButton);
      let accordCollapse = document.createElement('div');
      accordCollapse.classList.add('accordion-collapse', 'collapse');
      accordCollapse.setAttribute('id', platformList[i]);
      accordCollapse.setAttribute('aria-labelledby', 'flush-heading'+i);
      accordCollapse.setAttribute('data-bs-parent', '#sideNavAccordion');
      for(let j=0; j<content.length;j++){
        if(content[j].os === platformList[i] && content[j].language === language){
          let accordBody= document.createElement('div');
          accordBody.classList.add('accordion-body');
          accordBody.textContent = content[j].name;
          accordCollapse.appendChild(accordBody);
        }
      }
      accordItem.appendChild(accordTitle);
      accordItem.appendChild(accordCollapse);
      headFragment.appendChild(accordItem);
  }
  selectAccordion.appendChild(headFragment);
}