//Initial content
function loadContent() {
  let languages = JSON.parse(localStorage.getItem("language_set"));
  let content = JSON.parse(localStorage.getItem("contentSet"));
  if (localStorage.getItem("defaultLanguage") === null) {
    localStorage.setItem("defaultLanguage", "en");
  }
  if (localStorage.getItem("defaultPlatform") === null) {
    localStorage.setItem("defaultPlatform", content[0].os);
  }
  if (localStorage.getItem("defaultTitle") === null) {
    localStorage.setItem("defaultTitle", content[0].name);
  }
  let defaultLanguage = localStorage.getItem("defaultLanguage");
  let defaultPlatform = localStorage.getItem("defaultPlatform");
  let defaultTitle = localStorage.getItem("defaultTitle");
  console.log(defaultLanguage, defaultPlatform, defaultTitle);
  const langOption = document.getElementById("langSelect");
  const langFragment = document.createDocumentFragment();
  for (let i = 0; i < languages.length; i++) {
    let langListItem = document.createElement("option");
    langListItem.classList.add("accordion-item");
    langListItem.setAttribute("value", languages[i]);
    if (languages[i] === defaultLanguage) {
      langListItem.selected = true;
    }
    langListItem.textContent = languages[i];
    langFragment.appendChild(langListItem);
  }
  langOption.appendChild(langFragment);
  document.getElementById("langSelect").addEventListener("change", (e) => {
    let langValue = e.target.value;
    languageListner(langValue);
  });
  langBasedNav(defaultLanguage);
  showDocumetation(defaultTitle, defaultPlatform);
  document.getElementById("searchitem").addEventListener("keyup", (e) => {
    let searchedValue = e.target.value;
    findTitle(searchedValue);
  });
}
function languageListner(language) {
  localStorage.setItem("defaultLanguage", language);
  let defaultLanguage = localStorage.getItem("defaultLanguage");
  langBasedNav(defaultLanguage);
}

function showDocumetation(name, platform) {
  localStorage.setItem("defaultPlatform", platform);
  localStorage.setItem("defaultTitle", name);
  let defaultLanguage = localStorage.getItem("defaultLanguage");
  fetch(
    "doc_files/pages." + defaultLanguage + "/" + platform + "/" + name + ".md"
  )
    .then((resp) => {
      return resp.text();
    })
    .then((text) => {
      document.getElementById("content").innerHTML = marked(text);
      document.querySelectorAll("code").forEach((block) => {
        hljs.configure({
          tabReplace: "    ",
          languages: ["bash", "shell"],
        });
        hljs.highlightBlock(block);
      });
    });
}

function filteredContentList() {
  let unfilteredLanguage_set = [];
  let unfilteredLanguage = "";
  let language_set = [];
  fetch("./index.json")
    .then((response) => response.json())
    .then((data) => {
      console.log("Done fetching");
      let contentSet = [];
      for (let i = 0; i < data.commands.length; i++) {
        for (let j = 0; j < data.commands[i].targets.length; j++) {
          data.commands[i].targets[j].name = data.commands[i].name;
          contentSet.push(data.commands[i].targets[j]);
        }
      }

      for (let i = 0; i < contentSet.length; i++) {
        unfilteredLanguage = contentSet[i].language;
        unfilteredLanguage_set.push(unfilteredLanguage);
      }
      language_set = removeDuplicates(unfilteredLanguage_set);
      localStorage.setItem("language_set", JSON.stringify(language_set));
      localStorage.setItem("contentSet", JSON.stringify(contentSet));
      console.log("Done setting content set");
    });
}

function removeDuplicates(languageArray) {
  return languageArray.filter(
    (item, index) => languageArray.indexOf(item) === index
  );
}

function langBasedNav(language) {
  let content = JSON.parse(localStorage.getItem("contentSet"));
  let platformUnSortedList = [];
  for (let i = 0; i < content.length; i++) {
    if (content[i].language === language) {
      platformUnSortedList.push(content[i].os);
    }
  }
  let platformList = removeDuplicates(platformUnSortedList);
  const selectAccordion = document.getElementById("sideNavAccordion");
  selectAccordion.innerHTML = "";
  const headFragment = document.createDocumentFragment();
  for (let i = 0; i < platformList.length; i++) {
    let accordItem = document.createElement("div");
    accordItem.classList.add("accordion-item");
    let accordTitle = document.createElement("h2");
    accordTitle.classList.add("accordion-header");
    accordTitle.setAttribute("id", "flush-heading" + i);
    const platformButton = document.createElement("button");
    platformButton.classList.add("accordion-button", "collapsed");
    platformButton.setAttribute("type", "button");
    platformButton.setAttribute("data-bs-toggle", "collapse");
    platformButton.setAttribute("data-bs-target", "#" + platformList[i]);
    platformButton.setAttribute("aria-expanded", "false");
    platformButton.setAttribute("aria-controls", platformList[i]);
    platformButton.textContent = platformList[i];
    accordTitle.appendChild(platformButton);
    let accordCollapse = document.createElement("div");
    accordCollapse.classList.add(
      "accordion-collapse",
      "collapse",
      "accordion-height"
    );
    accordCollapse.setAttribute("id", platformList[i]);
    accordCollapse.setAttribute("aria-labelledby", "flush-heading" + i);
    accordCollapse.setAttribute("data-bs-parent", "#sideNavAccordion");
    for (let j = 0; j < content.length; j++) {
      if (
        content[j].os === platformList[i] &&
        content[j].language === language
      ) {
        let accordBody = document.createElement("div");
        accordBody.classList.add("accordion-body");
        let accordBodyTitle = document.createElement("a");
        accordBodyTitle.classList.add("p-2", "highlight");
        accordBodyTitle.setAttribute("type", "button");
        accordBodyTitle.setAttribute("id", content[j].name);
        accordBodyTitle.setAttribute("data-platform", platformList[i]);
        accordBodyTitle.textContent = content[j].name;
        accordBodyTitle.addEventListener("click", (e) => {
          let selctedTitle = e.target.id;
          let selectedPlatform = platformList[i];
          showDocumetation(selctedTitle, selectedPlatform);
        });
        accordBody.appendChild(accordBodyTitle);
        accordCollapse.appendChild(accordBody);
      }
    }
    accordItem.appendChild(accordTitle);
    accordItem.appendChild(accordCollapse);
    headFragment.appendChild(accordItem);
  }
  selectAccordion.appendChild(headFragment);
}

function findTitle(findx) {
  let content = JSON.parse(localStorage.getItem("contentSet"));
  let selectedLanguage = localStorage.getItem("defaultLanguage");
  console.log(content.length);
  let fetchedResults = [];
  for (let i = 0; i < content.length; i++) {
    if (
      content[i].name.includes(findx) &&
      content[i].language == selectedLanguage
    ) {
      let result = {
        os: content[i].os,
        name: content[i].name,
      };
      fetchedResults.push(result);
    }
  }
  console.log(fetchedResults);
  let searchResult = "";
  if (fetchedResults.length != 0) {
    for (let j = 0; j < 5; j++) {
      if (fetchedResults[j] !== undefined) {
        searchResult +=
          `<li>
              <button type="button" id="` +
          fetchedResults[j].name +
          `">` +
          fetchedResults[j].name +
          `</button ></li>`;
      }
    }
    document.getElementById("search-results").innerHTML = searchResult;
  } else {
    searchResult = "No result found";
    document.getElementById("search-results").innerHTML = searchResult;
  }
}
