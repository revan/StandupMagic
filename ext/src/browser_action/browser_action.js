window.addEventListener('load', function() {
  fetchYesterday();
  fetchToday();

  // Our default error handler.
  Asana.ServerModel.onError = function(response) {
    showError(response.errors[0].message);
  };

  // Ah, the joys of asynchronous programming.
  // To initialize, we've got to gather various bits of information.
  // Starting with a reference to the window and tab that were active when
  // the popup was opened ...
  chrome.windows.getCurrent(function(w) {
    chrome.tabs.query({
      active: true,
      windowId: w.id
    }, function(tabs) {
      // Now load our options ...
      Asana.ServerModel.options(function(options) {
        // And ensure the user is logged in ...
        Asana.ServerModel.isLoggedIn(function(is_logged_in) {
          if (is_logged_in) {
            if (window.quick_add_request) {
              // If this was a QuickAdd request (set by the code popping up
              // the window in Asana.ExtensionServer), then we have all the
              // info we need and should show the add UI right away.
              showAddUi(
                  quick_add_request.url, quick_add_request.title,
                  quick_add_request.selected_text, options);
            } else {
              // Otherwise we want to get the selection from the tab that
              // was active when we were opened. So we set up a listener
              // to listen for the selection send event from the content
              // window ...
              var selection = "";
              var listener = function(request, sender, sendResponse) {
                if (request.type === "selection") {
                  chrome.extension.onRequest.removeListener(listener);
                  console.info("Asana popup got selection");
                  selection = "\n" + request.value;
                }
              };
              chrome.extension.onRequest.addListener(listener);

              // ... and then we make a request to the content window to
              // send us the selection.
              var tab = tabs[0];
              chrome.tabs.executeScript(tab.id, {
                code: "(Asana && Asana.SelectionClient) ? Asana.SelectionClient.sendSelection() : 0"
              }, function() {
                fetchYesterday(options);
                // The requests appear to be handled synchronously, so the
                // selection should have been sent by the time we get this
                // completion callback. If the timing ever changes, however,
                // that could break and we would never show the add UI.
                // So this could be made more robust.
                showAddUi(tab.url, tab.title, selection, options);
              });
            }
          } else {
            // The user is not even logged in. Prompt them to do so!
            showLogin(Asana.Options.loginUrl(options));
          }
        });
      });
    });
  });
});

var appendEach = function(list){
  $("#standup-contents").append("<ol>");
  list.forEach(function(entry) {
    $("#standup-contents").append('<li>'+entry.name+'</li>');
  })
  $("#standup-contents").append("</ol>");
}

var fetchToday = function(options) {
  var self = this;

  //get workspace
  Asana.ServerModel.workspaces(function(workspace) {
    console.log(workspace);

    Asana.ServerModel.me(function(user) {
      Asana.ServerModel.tasksWorkspaceTODO(workspace[0].id, 
        function(response) {
          $("#standup-contents").append("<h3>Today:</h3>");
          appendEach(response);
        });
    });
  });
}

var fetchYesterday = function(options) {
  var self = this;

  //get workspace
  Asana.ServerModel.workspaces(function(workspace) {
    console.log(workspace);

    Asana.ServerModel.me(function(user) {
      Asana.ServerModel.tasksWorkspace(workspace[0].id,
        function(response) {
          $("#standup-contents").append("<h3>Yesterday:</h3>");
          appendEach(response);
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
