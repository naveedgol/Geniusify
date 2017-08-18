var accessToken;

function linkBuilder( text, url )
{
    return "<a href=\"" + url + "\">" + text + "</a>";
}

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
            if( obj.response.hits.length == 0 )
            {
                document.getElementById( "helpText" ).innerHTML = "No results found.";
                document.getElementById( "helpText" ).style.display = "block";
                return;
            }

            document.getElementById( "title" ).innerHTML = linkBuilder( obj.response.hits[0].result.title, obj.response.hits[0].result.url );
            document.getElementById( "title" ).style.display = "block";

            document.getElementById( "artist" ).innerHTML = linkBuilder( obj.response.hits[0].result.primary_artist.name, obj.response.hits[0].result.primary_artist.url );
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

            var numberOfFeatures = obj.response.song.featured_artists.length;
            for( var i = 0; i < numberOfFeatures; i++ )
            {
                if( i == numberOfFeatures - 1 && i != 0 ) //second last
                {
                    document.getElementById( "features" ).innerHTML += "<span style='color: #9a9a9a'> & </span>";
                }
                else if( i > 0 )
                {
                    document.getElementById( "features" ).innerHTML += "<span style='color: #9a9a9a'>, </span>";
                }
                document.getElementById( "features" ).innerHTML += linkBuilder( obj.response.song.featured_artists[i].name , obj.response.song.featured_artists[i].url );
            }
            if( numberOfFeatures > 0 )
            {
                document.getElementById( "features" ).style.display = "inline";
                document.getElementById( "featuresTag" ).style.display = "inline";
                document.getElementById( "features" ).innerHTML += "<br>"
            }

            if( obj.response.song.album != null )
            {
                document.getElementById( "album" ).innerHTML += linkBuilder( obj.response.song.album.name, obj.response.song.album.url );
                document.getElementById( "album" ).style.display = "inline";
                document.getElementById( "albumTag" ).style.display = "inline";
            }

            for( var i = 0; i < obj.response.song.producer_artists.length; i++ )
            {
                document.getElementById( "producers" ).innerHTML += "• " + linkBuilder( obj.response.song.producer_artists[i].name, obj.response.song.producer_artists[i].url ) + "<br>";
                document.getElementById( "producerList" ).style.display = "block";
            }

            for( var i = 0; i < obj.response.song.writer_artists.length; i++ )
            {
                document.getElementById( "writers" ).innerHTML += "• " + linkBuilder( obj.response.song.writer_artists[i].name, obj.response.song.writer_artists[i].url ) + "<br>";
                document.getElementById( "writerList" ).style.display = "block";
            }

            var songRelationships = [ "samples", "sampledIn", "interpolates", "interpolatedBy", "coverOf", "coveredBy", "remixOf", "remixedBy", "liveVersionOf", "performedLiveAs" ];
            for( var j = 0; j < 10; j++ )
            {
                for( var i = 0; i < obj.response.song.song_relationships[j].songs.length; i++ )
                {
                    document.getElementById( songRelationships[j] ).innerHTML += "• " + linkBuilder( obj.response.song.song_relationships[j].songs[i].full_title, obj.response.song.song_relationships[j].songs[i].url ) + "<br>";
                    document.getElementById( songRelationships[j] + "List" ).style.display = "block";
                }
            }
            for( var i = 0; i < obj.response.song.media.length; i++ )
            {
                if( obj.response.song.media[i].provider == "spotify" )
                {
                    document.getElementById( "spotifyPlayer" ).src = "https://open.spotify.com/embed?uri=spotify%3Atrack%3A" + obj.response.song.media[i].url.substring( obj.response.song.media[i].url.indexOf( 31 ) );
                    document.getElementById( "spotifyPlayer" ).style.display = "block";
                }
            }

        }

        var links = document.getElementsByTagName("a");
        for( var i = 0; i < links.length; i++ )
        {
            (function () {
                var ln = links[i];
                ln.onclick = function () {
                    chrome.tabs.create({active: true, url: ln.href});
                };
            })();
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
