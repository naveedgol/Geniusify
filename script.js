var accessToken;

function geniusSearch( text )
{
    if( !text )
    {
        document.getElementById( "helpText" ).style.display = "block";
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open(
        'GET',
        "https://api.genius.com/search?access_token=" + accessToken + "&q=" + text,
        true
    );
    xhr.send();

    xhr.onreadystatechange = function()
    {
        if( xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200 )
        {
            var obj = JSON.parse( xhr.responseText );
            document.getElementById( "title" ).innerHTML = "Title: " + obj.response.hits[0].result.title;
            document.getElementById( "title" ).style.display = "block";
            document.getElementById( "artist" ).innerHTML = "Artist: " + obj.response.hits[0].result.primary_artist.name;
            document.getElementById( "artist" ).style.display = "block";
            document.getElementById( "cover" ).src = obj.response.hits[0].result.song_art_image_thumbnail_url;
            document.getElementById( "cover" ).style.display = "block";
        }
    }
}

chrome.tabs.executeScript(
    {
        code: "window.getSelection().toString();"
    },
    function( selection )
    {
        chrome.storage.sync.get(
            'accessToken',
            function( result )
            {
                accessToken = result.accessToken;
                if( !accessToken )
                {
                    document.getElementById( "helpText" ).style.display = "block";
                    document.getElementById( "helpText" ).innerHTML = "Authenticate in settings";
                }
                else
                {
                    geniusSearch( selection[0] );
                }
            }
        );
    }
);
