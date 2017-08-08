var pause_every = 20
// var minReacTime = 7000
var minReacTime = 0

var count;
$.ajax({
  url:"counter.php",
  type:"POST",
  async:false,
  success:function(d){
    count = d;
  }
});

var tr_batches;
$.ajax({
  url:"batch.php",
  type:"POST",
  async:false,
  success:function(d){
    tr_batches = JSON.parse(d);
  }
});

var code;
$.ajax({
  url:"code.php",
  type:"POST",
  async:false,
  success:function(d){
    code = d;
  }
});

function transpose(a) {
    return Object.keys(a[0]).map(function(c) {
        return a.map(function(r) { return r[c]; });
    });
}

var batches = transpose(tr_batches)

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

var batch = batches[count % 20];

batch = shuffle(batch);

// Helper functions. Shows slides. We're using jQuery here - the **$**
// is the jQuery selector function, which takes as input either a DOM
// element or a CSS selector string.

function showSlide(id) {
    // Hide all slides
    $(".slide").hide();
    // Show just the slide we want to show
    $("#"+id).show();
}

// Function to concatenate key and values of dictionary into string
function dict_to_str(dict)
{
    var str = '';
    var temp = '';
    for ( var key in dict)
    {
	temp = key.concat(': ', dict[key], '\n');
	str = str.concat(temp);
    }
    return str;
}

// Function to save the experiment data at the end
function saveExperimentData(experiment){
    // First convert raw data from the experiment dict to a string
    $.post("save_results.php", {"results": dict_to_str(experiment.data)});
}

var n_test = batch.length

var myKeyBindings = {"i": -1, "p": 1};

$(".i-key").text("i");
$(".p-key").text("p");

//Build trial sequence:

var myTrials=[];

// Instructions
myTrials.push(myTrial={
    trial_type: "foo",
    imgPath:'',
});
myTrials.push(myTrial={
    trial_type: "instruction1",
    imgPath:'',
});
myTrials.push(myTrial={
    trial_type: "instruction2",
    imgPath:'',
});

var i = 0
while (i < n_test){
    myTrial = {
        trial_type: "test",
        imgPath:batch[i],
    }
    myTrials.push(myTrial);
    i = i + 1
    if (i % pause_every == 0 && i < n_test){
        myTrial = {
            trial_type: "pause",
            n_trial:i,
        }
        myTrials.push(myTrial);
    }
}

// Show the instructions slide -- this is what we want subjects to see first.
showSlide("introduction");

// The main event
var experiment = {
    //Objet to be submitted:
    data :{
        imgPath:[],
        answer:[],
        rt:[],
        code:[],
    },

    // Parameters for this sequence.
    trials: myTrials,
    // Experiment-specific parameters - which keys map to odd/even
    keyBindings: myKeyBindings,

    // The function that gets called when the sequence is finished.
    end: function() {
        // Show the finish slide.
        experiment.data.code.push(code + Math.floor(Math.random() * 999999).toString());
        saveExperimentData(experiment)
        showSlide("finished");
        $("#code").html(code);
    },

    play: function() {
        // If the number of remaining trials is 0, we're done, so call the end function.
        if (experiment.trials.length == 0) {
            experiment.end();
            return;
        }

        var current_trial = experiment.trials[0];

        if (current_trial.trial_type == "instruction1")
            {
                showSlide("instruction1");
            }
        if (current_trial.trial_type == "instruction2")
            {
                showSlide("instruction2");
            }
        if (current_trial.trial_type == "pause")
            {
                showSlide("pause");
                $("#n_trial").html(current_trial.n_trial)
                $("#n_test").html(n_test)
            }
        if (current_trial.trial_type == "test")
            {
                var $current_img= $('<img>').attr('src', current_trial.imgPath + "?a=" + Math.random()).height(400).width(400);
                showSlide("stage");

                // Display the img.
                $("#img").html($current_img);
                $("#path").html(current_trial.imgPath);

                // Get the current time so we can compute reaction time later.
                var startTime = (new Date()).getTime();

                var keyPressHandler = function(event) {
                    var keyCode = event.which;
		    var endTime = (new Date()).getTime();
		    var reacTime = endTime - startTime;

                //taking into account number keys from both regular
                //keyboard and numpad
                    if ((keyCode != 73 && keyCode != 80) | reacTime < minReacTime) {
                        // If a key that we don't care about is pressed,
                        // re-attach the handler (see the end of this script
                        // for more info)
                        $(document).one("keydown", keyPressHandler);

                    }
                    else
                    {
                        // If a valid key is pressed record the reaction time
                        // (current time minus start time), which key was
                        // pressed, and what that means (even or odd).
                        var key;
                        if (keyCode == 73)
                        {
                            key="i";
                        }
                        else
                        {
                            key="p";
                        };
                        var userAnswer = experiment.keyBindings[key];
                        experiment.data.imgPath.push(current_trial.imgPath);
                        experiment.data.answer.push(userAnswer);
                        experiment.data.rt.push(reacTime);
                        experiment.next()
                    }
                };

                $(document).one("keydown", keyPressHandler);
            }

    },
    replay: function() {
        var current_trial = experiment.trials[0];
        var $current_img= $('<img>').attr('src', current_trial.imgPath +"?a="+Math.random()).height(400).width(400);
        showSlide("stage");
        $("#img").html($current_img);
    },

    // The work horse of the sequence - what to do on every trial.
    next: function() {
        // Get the current trial - <code>shift()</code> removes the
        // first element of the array and returns it.
        experiment.trials.shift();
        experiment.play()
    }
}
