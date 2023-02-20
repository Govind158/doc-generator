// Listen to page loading
  window.addEventListener("load", loadContent);

//Content on loading the page
function loadContent() {
  const allLanguages = JSON.parse(localStorage.getItem("allLanguages"));

  if (localStorage.getItem("defaultLanguage") === null) {
    localStorage.setItem("defaultLanguage", "en");
  }
  const defaultLanguage = localStorage.getItem("defaultLanguage");
  sortedContentList(defaultLanguage);
  const langOption = document.getElementById("langSelect");
  const langFragment = document.createDocumentFragment();
  for (let i = 0; i < allLanguages.length; i++) {
    let langListItem = document.createElement("option");~
    langListItem.classList.add("accordion-item");
    langListItem.setAttribute("value", allLanguages[i]);
    if (allLanguages[i] === defaultLanguage) {
      langListItem.selected = true;
    }
    langListItem.textContent = allLanguages[i];
    langFragment.appendChild(langListItem);
  }
  langOption.appendChild(langFragment);
  document.getElementById("langSelect").addEventListener("change", (e) => {
    let langValue = e.target.value;
    languageListner(langValue);
  });
  setUrl(defaultLanguage);
}
function languageListner(language) {
  localStorage.setItem("defaultLanguage", language);
  let defaultLanguage = localStorage.getItem("defaultLanguage");
  setUrl(defaultLanguage);
}

function setUrl(language, platform, filename){
  var base_url = window.location.origin;
  console.log(base_url);
  if(platform === undefined && filename === undefined){
    const topic = 'index';
    let url = new URL(base_url);
    var search_params = url.searchParams;
    search_params.append('language', language);
    search_params.append('topic', `${topic}.md`);
    url.search = search_params.toString();
    var new_url = url.toString();
    history.pushState({}, null, new_url);
    langBasedNav(language);
    showDocumetation(language, null, topic);
  }
  else{
    let url = new URL(base_url);
    var search_params = url.searchParams;
    search_params.append('language', language);
    search_params.append('platform', platform);
    search_params.append('topic', `${filename}.md`);
    url.search = search_params.toString();
    var new_url = url.toString();
    history.pushState({}, null, new_url);
    langBasedNav(language);
    showDocumetation(language, platform, filename);
  }
}
async function showDocumetation(language, platform, topic) {
  const platformName = platform === null? '': `${platform}/`;
  try {
    const resp = await fetch(`manpages/pages.${language}/${platformName}${topic}.md`);
    const text = await resp.text();
    document.getElementById("content").innerHTML = marked(text);
    document.querySelectorAll("code").forEach((block) => {
      hljs.configure({
        tabReplace: "    ",
        languages: ["bash", "shell"],
      });
      hljs.highlightBlock(block);
    });
  } 
  catch (error) {
    console.error(error);
  }
}
// Convert JSon file to preffered array
async function sortedContentList(language){
  let unfilteredPlatformSet = [];
  let unfilteredPlatform = [];
  let platformUniqueSet = [];
  let unfilteredLanguage_set = [];
  let unfilteredLanguage = "";
  let allLanguages = [];
  const response = await fetch("./index.json")
  const data = await response.json();
  console.log(data);
  const contentSet = [];
  for (let i = 0; i < data.commands.length; i++) {
    for (let j = 0; j < data.commands[i].targets.length; j++) {
      data.commands[i].targets[j].name = data.commands[i].name;
      contentSet.push(data.commands[i].targets[j]);
    }
  }
  let filteredContent = contentSet.filter(content => content.language === language);
  for (let i = 0; i < contentSet.length; i++) {
    unfilteredLanguage = contentSet[i].language;
    unfilteredLanguage_set.push(unfilteredLanguage);
  }
  for (let i = 0; i < filteredContent.length; i++) {
    unfilteredPlatformSet = filteredContent[i].os;
    unfilteredPlatform.push(unfilteredPlatformSet);
  }

  platformUniqueSet = removeDuplicates(unfilteredPlatform);
  allLanguages = removeDuplicates(unfilteredLanguage_set);
  const displayData = [];
  platformArray = [];
  titleList = [];
  for(const platform of platformUniqueSet){
    for(const content of filteredContent){
      if(content.os === platform){
        const extTitle = content.name;
        titleList.push(extTitle);
      }
    }
    const platformObj = {"name": platform, "items": titleList};
    platformArray.push(platformObj);
  }

  const langObj = {"language": language, "platforms": platformArray};
  displayData.push(langObj);
  console.log(displayData);
  localStorage.setItem("allLanguages", JSON.stringify(allLanguages));
  localStorage.setItem("contentSet", JSON.stringify(displayData));

}

function removeDuplicates(unsortedArray) {
  return unsortedArray.filter(
    (item, index) => unsortedArray.indexOf(item) === index
  );
}

function langBasedNav(language) {
  let content = JSON.parse(localStorage.getItem("contentSet"));
  if(content[0].language === language){
    const selectAccordion = document.getElementById("sideNavAccordion");
    selectAccordion.innerHTML = "";
    const headFragment = document.createDocumentFragment();
    for (let i = 0; i < content[0].platforms.length; i++) {
      let accordItem = document.createElement("div");
      accordItem.classList.add("accordion-item");
      let accordTitle = document.createElement("h2");
      accordTitle.classList.add("accordion-header");
      accordTitle.setAttribute("id", "flush-heading" + i);
      const platformButton = document.createElement("button");
      platformButton.classList.add("accordion-button", "collapsed");
      platformButton.setAttribute("type", "button");
      platformButton.setAttribute("data-bs-toggle", "collapse");
      platformButton.setAttribute("data-bs-target", "#" + content[0].platforms[i].name);
      platformButton.setAttribute("aria-expanded", "false");
      platformButton.setAttribute("aria-controls", content[0].platforms[i].name);
      platformButton.textContent = content[0].platforms[i].name;
      accordTitle.appendChild(platformButton);
      let accordCollapse = document.createElement("div");
      accordCollapse.classList.add(
        "accordion-collapse",
        "collapse",
        "accordion-height"
      );
      accordCollapse.setAttribute("id", content[0].platforms[i].name);
      accordCollapse.setAttribute("aria-labelledby", "flush-heading" + i);
      accordCollapse.setAttribute("data-bs-parent", "#sideNavAccordion");
      for (let j = 0; j < content[0].platforms[i].items.length; j++) {
      
          let accordBody = document.createElement("div");
          accordBody.classList.add("accordion-body");
          let accordBodyTitle = document.createElement("a");
          accordBodyTitle.classList.add("p-2", "highlight");
          accordBodyTitle.setAttribute("type", "button");
          accordBodyTitle.setAttribute("id", content[0].platforms[i].items[j]);
          accordBodyTitle.setAttribute("data-platform", content[0].platforms[i].name);
          accordBodyTitle.textContent = content[0].platforms[i].items[j];
          accordBodyTitle.addEventListener("click", (e) => {
            let selctedTitle = e.target.id;
            let selectedPlatform = content[0].platforms[i].name;
            setUrl(language, selectedPlatform, selctedTitle);
          });
          accordBody.appendChild(accordBodyTitle);
          accordCollapse.appendChild(accordBody);
      }
      accordItem.appendChild(accordTitle);
      accordItem.appendChild(accordCollapse);
      headFragment.appendChild(accordItem);
  }
  selectAccordion.appendChild(headFragment);
  }
}