// Listen to page loading
  window.addEventListener("load", loadContent);
  fetch(`./config.json`)
  .then((response) => response.json())
    .then((data) => {
      const url = new URL(window.location.href);
      if (localStorage.getItem("defaultLanguage") == null) {
         if(url.searchParams.has('language')){
          localStorage.setItem("defaultLanguage", url.searchParams.get('language'));
        }else{
          localStorage.setItem("defaultLanguage", data.defaultLanguage);
        }
      }
      // localStorage.setItem("defaultLanguage", data.defaultLanguage);
      localStorage.setItem("foldername", data.mdFoldername);
      localStorage.setItem("downloadPDF", data.downloadPDF);
      localStorage.setItem("indexJSON", data.indexJSON);
    });

//Content on loading the page
async function loadContent() {
  
  console.log(localStorage.getItem("defaultLanguage"));
  const defaultLanguage = localStorage.getItem("defaultLanguage");
  console.log(defaultLanguage);
  await sortedContentList(defaultLanguage);
  const allLanguages = JSON.parse(localStorage.getItem("allLanguages"));
  // console.log(allLanguages);
  // Show language selection list
  const langOption = document.getElementById("langSelect");
  const langFragment = document.createDocumentFragment();
  for (let i = 0; i < allLanguages.length; i++) {
    let langListItem = document.createElement("option");
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
  // Check if current url include any parameter
  const url = new URL(window.location.href);
  if (url.searchParams.has('language') && url.searchParams.has('platform') && url.searchParams.has('topic')) {
    console.log("URL search working");
    const language = url.searchParams.get('language');
    const platform = url.searchParams.get('platform');
    const topic = url.searchParams.get('topic');
    searchUrl(language, platform, topic);
  } else {
    setUrl(defaultLanguage, null, null);
  }
  pdfDowload();
}
// Listen to language selection
function languageListner(language) {
  localStorage.setItem("defaultLanguage", language);
  // let defaultLanguage = localStorage.getItem("defaultLanguage");
  setUrl(language);
}
// Show result for url searchs
function searchUrl(language, platform, filename){
  localStorage.setItem("defaultLanguage", language);
  const filenameWOExtension = filename.split(".").shift();
  console.log(filenameWOExtension);
  langBasedNav(language);
  showDocumetation(language, platform, filenameWOExtension);
}

// Show result for direct page visit
function setUrl(language, platform, filename){
  var base_url = window.location.origin;
  console.log(base_url);
  if(platform == null && filename == null){
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
    // Update url after navigation click
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
// Show documentation of titles
async function showDocumetation(language, platform, topic) {
  const folderName = localStorage.getItem("foldername");
  const platformName = platform === null? '': `${platform}/`;
  try {
    const resp = await fetch(`${folderName}/pages.${language}/${platformName}${topic}.md`);
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
// Convert JSon file to preffered array format
async function sortedContentList(language){
  const indexJSON = localStorage.getItem("indexJSON");
  let unfilteredPlatformSet = [];
  let unfilteredPlatform = [];
  let platformUniqueSet = [];
  let unfilteredLanguage_set = [];
  let unfilteredLanguage = "";
  let allLanguages = [];
  const response = await fetch(indexJSON)
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
  const platformArray = [];
  const titleList = [];
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
// Remove duplicates from the arrays of sortedContentList() function
function removeDuplicates(unsortedArray) {
  return unsortedArray.filter(
    (item, index) => unsortedArray.indexOf(item) === index
  );
}
// Show side navigation section to display platform & topics
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
  console.log("Nav changed")
}
// Insert link to 'Save as PDF button'
function pdfDowload(){
  const downloadButton = document.getElementById('dowload-button')
  const base_url = window.location.origin;
  const downloadPDF = localStorage.getItem("downloadPDF");
  downloadButton.href = `${base_url}${downloadPDF}`;
}

function findTitle(findx) {
  let content = JSON.parse(localStorage.getItem("contentSet"));
  let fetchedResults = [];
  for (let i = 0; i < content[0].platforms.length; i++) {
    for (let i = 0; i < content[0].platforms[i].items.length; j++) {
      if (content[0].platforms[i].items[j].includes(findx)){
        let result = {
          os: content[0].platforms[i].name,
          name: content[0].platforms[i].items[j]
        };
        fetchedResults.push(result);
      }
    }
  }
  console.log(fetchedResults);
  // let searchResult = "";
  // if (fetchedResults.length != 0) {
  //   for (let j = 0; j < 5; j++) {
  //     if (fetchedResults[j] !== undefined) {
  //       searchResult +=
  //         `<li>
  //             <button type="button" id="` +
  //         fetchedResults[j].name +
  //         `">` +
  //         fetchedResults[j].name +
  //         `</button ></li>`;
  //     }
  //   }
  //   document.getElementById("search-results").innerHTML = searchResult;
  // } else {
  //   searchResult = "No result found";
  //   document.getElementById("search-results").innerHTML = searchResult;
  // }
  
}