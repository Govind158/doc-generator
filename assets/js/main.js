async function loadContent(){
    var contents = [];
    var titleShow = '';
    await fetch('./index.json').then(response => {
        return response.json();
    }).then(data => {
        for(var i=0;i<data.commands.length;i++){
            var content ={};
            content.name = data.commands[i].name;
            content.platform = data.commands[i].platform;
            contents.push(content);
            titleShow += `
            <a type="button" id="`+ data.commands[i].name +`" onClick="fetchTitle(this.id)"><li class="nav-item my-1 p-2 highlight">`+ data.commands[i].name +`</li></a >`;
        }

        document.getElementById('tag-id').innerHTML = titleShow;
        var default_title = data.commands[0].name
        showdocumetation(default_title)
    });

}
async function fetchTitle(title_name){
    await fetch('./index.json').then(response => {
        return response.json();
    }).then(data => {
        for(var i=0;i<data.commands.length;i++){
                if(data.commands[i].name == title_name){
                var contentName ='';
                contentName = data.commands[i].name;
            }
        }
        showdocumetation(contentName);
    });   
}

function showdocumetation(title){

    fetch("tldr/pages/common/" + title + ".md")
    .then((resp)=>{return resp.text()})
    .then((text)=>{
        document.getElementById('content').innerHTML = marked(text)
        document.querySelectorAll('code').forEach((block) => { 
            hljs.configure({
                tabReplace: '    ',
                languages: ["bash", "shell"],
            })
            hljs.highlightBlock(block) 
        })
    })
}

async function findTitle(toFind){
    var fetchedTitle = [];
    await fetch('./index.json').then(response => {
        return response.json();
    }).then(data => {
        for(var i=0;i<data.commands.length;i++){
            if(data.commands[i].name.includes(toFind.value)){
                var tittleArray = data.commands[i].name;
                fetchedTitle.push(tittleArray);
            }
        }
    }); 
        console.log(fetchedTitle);
        var searchResult = '';
        if(fetchedTitle.length != 0){
            for(var j=0;j<5;j++){
                if(fetchedTitle[j] !== undefined){
                searchResult += `<li>
                <button type="button" id="`+ fetchedTitle[j] +`" onClick="fetchTitle(this.id)" data-bs-dismiss="modal">`+ fetchedTitle[j] +`</button ></li>`;
            }
            }
            document.getElementById('search-results').innerHTML = searchResult;
        }
        else{
            searchResult = 'No result found';   
            document.getElementById('search-results').innerHTML = searchResult;
        }
}
        
      


