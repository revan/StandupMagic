window.addEventListener('load', function() {
  //fetches today, then calls fetchYesterday()
  fetchToday();

  // Our default error handler.
  Asana.ServerModel.onError = function(response) {
    showError(response.errors[0].message);
  };
});

var appendEach = function(list, id){
  $(id).append("<ol>");
  list.forEach(function(entry) {
    $(id).append('<li>'+entry.name+'</li>');
  })
  $(id).append("</ol>");
}

var fetchToday = function() {
  var self = this;

  //get workspace
  Asana.ServerModel.workspaces(function(workspace) {
    Asana.ServerModel.me(function(user) {
      Asana.ServerModel.tasksWorkspaceTODO(workspace[0].id, 
        function(response) {
          appendEach(response, "#standup-today");

          fetchYesterday(response);
        });
    });
  });
}

var fetchYesterday = function(todo) {
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

// Show the add UI
var showAddUi = function(url, title, selected_text, options) {
  var self = this;
  showView("add");
  $("#notes").val(url + selected_text);
  $("#name").val(title);
  $("#name").focus();
  $("#name").select();
  Asana.ServerModel.me(function(user) {
    // Just to cache result.
    Asana.ServerModel.workspaces(function(workspaces) {
      $("#workspace").html("");
      workspaces.forEach(function(workspace) {
        $("#workspace").append(
            "<option value='" + workspace.id + "'>" + workspace.name + "</option>");
      });
      $("#workspace").val(options.default_workspace_id);
    });
  });
};

var showError = function(message) {
  console.log("Error: " + message);
  $("#error").css("display", "");
};

var hideError = function() {
  $("#error").css("display", "none");
};

// Helper to show the login page.
var showLogin = function(url) {
  $("#login_link").attr("href", url);
  $("#login_link").unbind("click");
  $("#login_link").click(function() {
    chrome.tabs.create({url: url});
    window.close();
    return false;
  });
  showView("login");
};

// Close the popup if the ESCAPE key is pressed.
window.addEventListener("keydown", function(e) {
  if (e.keyCode === 27) {
    window.close();
  }
}, /*capture=*/false);

$("#close-banner").click(function() { window.close(); });
