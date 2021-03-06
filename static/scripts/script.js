// https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

// Send quote text to submission form
// @param click A ClickEvent object
// @return none
function quote_post(click) {
	var comment = document.getElementById("submit_comment");
	comment.value += ">>" + click.target.text + "\n";
	comment.focus();
}

// Send quote text to submission from when coming from board index
// @return none
function quote_thread() {
	var hash = window.location.hash;

	if (hash[1] === "q") {
		quote_post({
			target: {
				text: hash.substring(2)
			}
		});
	}
}

// Restrict the size of the comment block to 1024 characters
// @return none
function restrict_comment_size() {
	var comment = document.getElementById("submit_comment");

	if (comment.value.length >= 4096) {
		comment.value = comment.value.slice(0, 4096);
	}
}

// Cancel form submission if input is invalid
// @return valid
function validate_input() {
	var file_input = document.getElementById("submit_file");

	if (window.FileReader && file_input.files && file_input.files[0]) {
		file = file_input.files[0];

		if (file.size / 1024 / 1024 > 15.0) {
			alert("File size cannot exceed 15 MB.");
			return false;
		}
	}
}

// Add click events to all reply links
// @return none
function add_anchor_listeners() {
	var elements = document.getElementsByClassName("link_reply");

	for (var i=0; i < elements.length; i++) {
		elements[i].onclick = quote_post;
	}
}

// Toggle post menu visibility
// @return none
function toggle_menu() {
	var child = this.parentNode.children[1];

	if (child.style.display === "block") {
		child.style.display = "none";
	} else {
		child.style.display = "block";
	}
}

// Add click events to all menu buttons
// @return none
function add_menu_listeners() {
	var buttons = document.getElementsByClassName("post_menu");

	for (i=0; i < buttons.length; i++) {
		var button = buttons[i];
		button.children[0].onclick = toggle_menu;
	}
}

// Add events to various user inputs
// @return none
function add_input_constraints() {
	var comment = document.getElementById("submit_comment");
	if (comment) {
		comment.onkeydown = restrict_comment_size;
		comment.onkeyup = restrict_comment_size;
	}

	var form = document.getElementById("submit_form");

	if (form) {
		form.onsubmit = validate_input;
	}
}

// Open a Tegaki canvas and add an image to it
// @param click Click event
// @param path Path to image (optional)
function remix(click, path) {
	var file  = document.getElementById("draw");
	var clear = document.getElementById("tegaki_clear");

	// get image
	var image = new Image();
	image.src = path ? path : this.dataset.path;

	image.onload = function() {
		Tegaki.open({
			onDone: function() {
				var dataURL = Tegaki.flatten().toDataURL('image/png');
				//var blob    = dataURItoBlob(dataURL);

				file.value     = dataURL;//blob;
				clear.disabled = false;
			},
			onCancel: function() {},
			width:  image.width,
			height: image.height
		});

		// Force some data into Tegaki
		Tegaki.layers[0].ctx.drawImage(image, 0, 0);
		Tegaki.addLayer();
		Tegaki.setActiveLayer(Tegaki.layers.length);
	}
}

// Add ClickEvent listeners to Tegaki buttons
// @return none
function prepare_tegaki() {
	var file   = document.getElementById("draw");
	var width  = document.getElementById("tegaki_width");
	var height = document.getElementById("tegaki_height");
	var draw   = document.getElementById("tegaki_draw");
	var clear  = document.getElementById("tegaki_clear");

	// Standard draw button
	if (draw) {
		draw.onclick = function() {
			Tegaki.open({
				onDone: function() {
					var dataURL = Tegaki.flatten().toDataURL('image/png');
					//var blob    = dataURItoBlob(dataURL);

					file.value     = dataURL;//blob;
					clear.disabled = false;
				},
				onCancel: function() {},
				width:  width.value > 2560 ? 2560 : width.value,
				height: height.value > 2560 ? 2560 : height.value
			});
		};
	}

	// Standard clear button
	if (clear) {
		clear.onclick = function() {
			Tegaki.destroy();
			file.value    = null;
			clear.disabled = true;
		};
	}

	// Remix buttons
	var buttons = document.getElementsByClassName("remix");
	for (i=0; i < buttons.length; i++) {
		var button = buttons[i];
		button.onclick = remix;
	}

	// Come from board, auto-remix
	var hash = window.location.hash;
	if (hash[1] === "r") {
		var button = document.getElementById(hash.slice(1));
		remix(null, button.dataset.path);
	}
}

// Check if document has loaded yet
// @return none
function ready() {
	if (document.readyState != "loading"){
		quote_thread();
		add_anchor_listeners();
		add_menu_listeners();
		prepare_tegaki();
		add_input_constraints();
	} else {
		document.addEventListener("DOMContentLoaded", quote_thread);
		document.addEventListener("DOMContentLoaded", add_anchor_listeners);
		document.addEventListener("DOMContentLoaded", add_menu_listeners);
		document.addEventListener("DOMContentLoaded", prepare_tegaki);
		document.addEventListener("DOMContentLoaded", add_input_constraints);
	}
}

ready();
