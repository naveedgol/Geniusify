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
            document.getElementById( "title" ).innerHTML = obj.response.hits[0].result.title;
            document.getElementById( "title" ).style.display = "block";
            document.getElementById( "artist" ).innerHTML = obj.response.hits[0].result.primary_artist.name;
            document.getElementById( "artist" ).style.display = "block";
            document.getElementById( "cover" ).src = obj.response.hits[0].result.song_art_image_thumbnail_url;
            document.getElementById( "cover" ).style.display = "block";
            geniusSongInfo( obj.response.hits[0].result.id );
        }
    }
}

function geniusSongInfo( songId )
{
    var xhr = new XMLHttpRequest();
    xhr.open(
        'GET',
        "https://api.genius.com/songs/" + songId + "?access_token=" + accessToken,
        true
    );
    xhr.send();

    xhr.onreadystatechange = function()
    {
        if( xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200 )
        {
            var obj = JSON.parse( xhr.responseText );
            document.getElementById( "album" ).innerHTML += obj.response.song.album.name;
            document.getElementById( "album" ).style.display = "inline";
            document.getElementById( "albumTag" ).style.display = "inline";
            for( var i = 0; i < obj.response.song.producer_artists.length; i++ )
            {
                document.getElementById( "producers" ).innerHTML += "• " + obj.response.song.producer_artists[i].name + "<br>";
            }
            document.getElementById( "producerList" ).style.display = "block";
            for( var i = 0; i < obj.response.song.writer_artists.length; i++ )
            {
                document.getElementById( "writers" ).innerHTML += "• " + obj.response.song.writer_artists[i].name + "<br>";
            }
            document.getElementById( "writerList" ).style.display = "block";
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
