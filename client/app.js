var $name, $age, $breed, $picture, $resume, $catList;

var apiUrl = 'http://localhost:3000/api/';

$(document).ready(function() {

    $('#addFile').on('submit', handleForm);

    $picture = $('#picture');
    $resume = $('#resume');
    $catList = $('#catList');

});


function handleForm(e) {
    e.preventDefault();

    var cat = {
        name:$name.val(),
        age:$age.val(),
        breed:$breed.val()
    }

    console.log(cat);

    // step 1 - make the cat, this gives us something to associate with
    $.post(apiUrl + 'files', cat).then(function(res) {

        //copy res since it has the id
        cat = res;

        var promises = [];

        // step 2: do we have binary crap?
        if($resume.val() != '') {
            console.log('i need to process the resume upload');
            promises.push(sendFile($resume.get(0).files[0], apiUrl + 'files/attachment/upload'));
        }

        if($picture.val() != '') {
            console.log('i need to process thepicture upload');
            promises.push(sendFile($picture.get(0).files[0], apiUrl + 'files/attachment/upload'));
        }

        // no need to see if I have promises, it still resolves if empty
        Promise.all(promises).then(function(results) {
            console.log('back from all promises', results);
            //update cat if we need to
            if(promises.length >= 1) {
                /*
                so we have one or two results, we could add some logic to see what
                we selected so we know what is what, but we can simplify since the result
                contains a 'container' field that matches the property
                */
                results.forEach(function(resultOb) {
                    if(resultOb.result.files && resultOb.result.files.file[0].container) {
                        cat[resultOb.result.files.file[0].container] = resultOb.result.files.file[0].name;
                    }
                });
                console.dir(cat);
                //now update cat, we can't include the id though
                var id = cat.id;
                delete cat.id;
                $.post(apiUrl + 'files/'+id+'/replace', cat)
                }
        });

    });

}

//Stolen from: https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
function sendFile(file, url) {
    return new Promise(function(resolve, reject) {

        var xhr = new XMLHttpRequest();
        var fd = new FormData();

        xhr.open("POST", url, true);
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                resolve(JSON.parse(xhr.responseText));
            }
        };
        fd.append('file', file);
        xhr.send(fd);

    });
}