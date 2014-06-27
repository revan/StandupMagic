window.addEventListener('load', function() {
  //fetches today, then calls fetchAsanaYesterday()
  fetchAsanaToday();
  fetchOpenCL();

  // Our default error handler.
  Asana.ServerModel.onError = function(response) {
    showError(response.errors[0].message);
  };
});

var appendEachCL = function(list, id){
  $(id).append("<ol>");
  list.forEach(function(entry) {
    var string = "<li>" + entry.description;
    if (entry.reviewers.length > 0) {
      string += ": ";
      entry.reviewers.forEach(function(reviewer) {
        string += reviewer.split("@")[0];
      });
      string += "</li>";
    }
    $(id).append(string);
  });
  $(id).append("</ol>");
}

var fetchOpenCL = function() {
  chrome.storage.sync.get(["cl_address", "cl_email"], function(response) {
    var clURL = response.cl_address;
    var email = response.cl_email;
    var url = clURL + "/search?closed=3&owner="+ email + "&format=json";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        appendEachCL(JSON.parse(xhr.responseText).results, "#standup-cl");
      }
    }
    xhr.send();
  });
}

var appendEach = function(list, id){
  $(id).append("<ol>");
  list.forEach(function(entry) {
    $(id).append('<li>'+entry.name+'</li>');
  })
  $(id).append("</ol>");
}

var fetchAsanaToday = function() {
  var self = this;

  //get workspace
  Asana.ServerModel.workspaces(function(workspace) {
    Asana.ServerModel.me(function(user) {
      Asana.ServerModel.tasksWorkspaceTODO(workspace[0].id, 
        function(response) {
          appendEach(response, "#standup-today");

          fetchAsanaYesterday(response);
        });
    });
  });
}

var fetchAsanaYesterday = function(todo) {
  var self = this;

  //get workspace
  Asana.ServerModel.workspaces(function(workspace) {
    Asana.ServerModel.me(function(user) {
      Asana.ServerModel.tasksWorkspace(workspace[0].id,
        function(response) {
          //remove any intersection with todo
          console.log(todo);
          console.log(response);
          for (var i = response.length-1; i>=0; i--) {
            for (var k = 0; k < todo.length; k++) {
              if (response[i].id === todo[k].id) {
                response.splice(i, 1);
                break;
              }
            }
          }
          appendEach(response, "#standup-yesterday");
        });
    });
  });
}

// Close the popup if the ESCAPE key is pressed.
window.addEventListener("keydown", function(e) {
  if (e.keyCode === 27) {
    window.close();
  }
}, /*capture=*/false);

$("#close-banner").click(function() { window.close(); });
