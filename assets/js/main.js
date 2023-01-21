// async
function loadContent() {
  let titleShow = "";
  // await
  fetch("./index.json")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (let i = 0; i < data.commands.length; i++) {
        titleShow +=
          `<a type="button" id="` +
          data.commands[i].name +
          `" onClick="fetchTitle(this.id)"><li class="nav-item my-1 p-2 highlight">` +
          data.commands[i].name +
          `</li></a >`;
      }
      document.getElementById("tag-id").innerHTML = titleShow;
      let default_title = data.commands[0].name;
      let default_platform = data.commands[0].platform[0];
      let default_language = "";

      showdocumetation(default_title, default_language, default_platform);
      fetchLanguagePlatform(default_title);
      let languageNames = new Intl.DisplayNames(["en"], { type: "language" });
      console.log(languageNames.of("fr"));
    })
    .catch((error) => {
      console.log(error);
    });
}
async function fetchTitle(title_name) {
  let contentName = "";
  let contentLanguage = "";
  let contentPlatform = "";
  await fetch("./index.json")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (let i = 0; i < data.commands.length; i++) {
        if (data.commands[i].name == title_name) {
          contentName = data.commands[i].name;
          contentLanguage = data.commands[i].language[0];
          contentPlatform = data.commands[i].platform[0];
        }
      }
      showdocumetation(contentName, contentLanguage, contentPlatform);
    });
}

function fetchLanguagePlatform(title_name) {
  let languageList = "";
  let platformList = "";

  fetch("./index.json")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (let i = 0; i < data.commands.length; i++) {
        if (data.commands[i].name == title_name) {
          for (let j = 0; j < data.commands[i].language.length; j++) {
            let languageNames = new Intl.DisplayNames(["en"], {
              type: "language",
            });
            let languageSymbol = data.commands[i].language[j];
            console.log(`Symbol = ${languageSymbol}`);
            console.log(languageNames.of(languageSymbol));
            languageList +=
              `<li class="nav-item my-1 p-2 highlight"><a type="button" id="` +
              data.commands[i].language[j] +
              `" onClick="showdocumetation(undefined, this.id, undefined)">` +
              data.commands[i].language[j] +
              `</a ></li>`;
          }
          for (let k = 0; k < data.commands[i].platform.length; k++) {
            platformList +=
              `<a type="button" id="` +
              data.commands[i].platform[k] +
              `" onClick="showdocumetation(undefined, "", this.id)"><li class="nav-item my-1 p-2 highlight">` +
              data.commands[i].platform[k] +
              `</li></a >`;
          }
        }
      }

      document.getElementById("lang-id").innerHTML = languageList;
      document.getElementById("platform-id").innerHTML = platformList;
    });
}

function showdocumetation(titleName, lang, os) {
  let currentLanguage = "";
  if (titleName != "undefined") {
    localStorage.setItem("title", titleName);
  }
  if (lang != "") {
    localStorage.setItem("language", lang);
  }
  if (os != "undefined") {
    localStorage.setItem("platform", os);
  }
  let currentTitle = localStorage.getItem("title");
  if (lang != "") {
    currentLanguage = "." + localStorage.getItem("language");
  }
  let currentPlatform = localStorage.getItem("platform");
  fetchLanguagePlatform(currentTitle);
  fetch(
    "doc_files/pages" +
      currentLanguage +
      "/" +
      currentPlatform +
      "/" +
      currentTitle +
      ".md"
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

async function findTitle(toFind) {
  let fetchedTitle = [];
  await fetch("./index.json")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (let i = 0; i < data.commands.length; i++) {
        if (data.commands[i].name.includes(toFind.value)) {
          let tittleArray = data.commands[i].name;
          fetchedTitle.push(tittleArray);
        }
      }
    });
  console.log(fetchedTitle);
  let searchResult = "";
  if (fetchedTitle.length != 0) {
    for (let j = 0; j < 5; j++) {
      if (fetchedTitle[j] !== undefined) {
        searchResult +=
          `<li>
                <button type="button" id="` +
          fetchedTitle[j] +
          `" onClick="fetchTitle(this.id)" data-bs-dismiss="modal">` +
          fetchedTitle[j] +
          `</button ></li>`;
      }
    }
    document.getElementById("search-results").innerHTML = searchResult;
  } else {
    searchResult = "No result found";
    document.getElementById("search-results").innerHTML = searchResult;
  }
}
