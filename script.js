var accessToken;
var songRelationships = [ "samples", "sampledIn", "interpolates", "interpolatedBy", "coverOf", "coveredBy", "remixOf", "remixedBy", "liveVersionOf", "performedLiveAs" ];
var searchResults = [];
var currentResult = 0;
var internallyLinked = false;

function optionsPrompt()
{
    document.getElementById( "helpText" ).innerHTML = "Go to " + "<button id=\"optionsButton\">" + "options" + "</button>" + " and login.";
    document.getElementById( "helpText" ).style.display = "block";
    document.getElementById( 'optionsButton' ).addEventListener(
        'click',
        function()
        {
            chrome.runtime.openOptionsPage();
        }
    );
}

function clear()
{
    var p = document.getElementsByTagName( "p" );
    for( var i = 0; i < p.length; i++ )
    {
        p[i].style.display = "none";
    }
    var details = document.getElementsByTagName( "details" );
    for( var i = 0; i < details.length; i++ )
    {
        details[i].style.display = "none";
        details[i].open = false;
    }
    var img = document.getElementsByTagName( "img" );
    for( var i = 0; i < img.length; i++ )
    {
        img[i].style.display = "none";
    }
    var iframe = document.getElementsByTagName( "iframe" );
    for( var i = 0; i < iframe.length; i++ )
    {
        iframe[i].src = "";
        iframe[i].style.display = "none";
    }

    document.getElementById( "features" ).innerHTML = "";
    document.getElementById( "album" ).innerHTML = "";
    document.getElementById( "releaseDate" ).innerHTML = "";
    document.getElementById( "producers" ).innerHTML = "";
    document.getElementById( "writers" ).innerHTML = "";
    for( var i = 0; i < songRelationships.length; i++ )
    {
        document.getElementById( songRelationships[i] ).innerHTML = "";
    }
}

function externalLinkBuilder( text, url )
{
    return "<a class=\"externalLink\" href=\"" + url + "\">" + text + "</a>";
}

function internalLinkBuilder( text, songId )
{
    return "<div class=\"internalLink\" id=\"" + songId + "\">" + text + "</div>";
}

function geniusSearch( text )
{
    if( !text )
    {
        document.getElementById( "helpText" ).innerHTML = "Highlight some text then click me!";
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

    clear();

    xhr.onreadystatechange = function()
    {
        if( xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200 )
        {
            var json = JSON.parse( xhr.responseText );

            if( json.response.hits.length == 0 )
            {
                document.getElementById( "helpText" ).innerHTML = "No results found.";
                document.getElementById( "helpText" ).style.display = "block";
                return;
            }

            var topHit = json.response.hits[0].result;

            document.getElementById( "title" ).innerHTML = externalLinkBuilder( topHit.title, topHit.url );
            document.getElementById( "title" ).style.display = "block";

            document.getElementById( "artist" ).innerHTML = externalLinkBuilder( topHit.primary_artist.name, topHit.primary_artist.url );
            document.getElementById( "artist" ).style.display = "block";

            document.getElementById( "cover" ).src = topHit.song_art_image_thumbnail_url;
            document.getElementById( "cover" ).style.display = "block";

            for( var i = 0; i < json.response.hits.length; i++ )
            {
                searchResults.push( json.response.hits[i].result.id );
            }

            if( searchResults[ currentResult + 1 ] )
            {
                document.getElementById( "nextResult" ).style.display = "inline";
            }
            if( searchResults[ currentResult - 1 ] )
            {
                document.getElementById( "previousResult" ).style.display = "inline";
            }

            geniusSongInfo( topHit.id, false );
        }
        else if( xhr.readyState == XMLHttpRequest.DONE && xhr.status != 200 )
        {
            optionsPrompt();
            return;
        }
    }
}

function geniusSongInfo( songId, isInternal )
{
    var xhr = new XMLHttpRequest();
    xhr.open(
        'GET',
        "https://api.genius.com/songs/" + songId + "?access_token=" + accessToken,
        true
    );
    xhr.send();

    if( isInternal )
    {
        clear();
    }

    xhr.onreadystatechange = function()
    {
        if( xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200 )
        {
            var json = JSON.parse( xhr.responseText );
            var song = json.response.song;

            if( isInternal )
            {
                document.getElementById( "title" ).innerHTML = externalLinkBuilder( song.title, song.url );
                document.getElementById( "title" ).style.display = "block";

                document.getElementById( "artist" ).innerHTML = externalLinkBuilder( song.primary_artist.name, song.primary_artist.url );
                document.getElementById( "artist" ).style.display = "block";

                document.getElementById( "cover" ).src = song.song_art_image_thumbnail_url;
                document.getElementById( "cover" ).style.display = "block";

                if( searchResults[ currentResult + 1 ] && !internallyLinked )
                {
                    document.getElementById( "nextResult" ).style.display = "inline";
                }
                if( searchResults[ currentResult - 1 ] && !internallyLinked )
                {
                    document.getElementById( "previousResult" ).style.display = "inline";
                }
            }

            var numberOfFeatures = song.featured_artists.length;
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
                document.getElementById( "features" ).innerHTML += externalLinkBuilder( song.featured_artists[i].name , song.featured_artists[i].url );
            }
            if( numberOfFeatures > 0 )
            {
                document.getElementById( "features" ).style.display = "inline";
                document.getElementById( "featuresTag" ).style.display = "inline";
                document.getElementById( "features" ).innerHTML += "<br>"
            }

            if( song.album != null )
            {
                document.getElementById( "album" ).innerHTML += externalLinkBuilder( song.album.name, song.album.url ) + "<br>";
                document.getElementById( "album" ).style.display = "inline";
                document.getElementById( "albumTag" ).style.display = "inline";
            }

            if( song.release_date != null )
            {
                var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
                document.getElementById( "releaseDate" ).innerHTML +=
                monthNames[ parseInt( song.release_date.substring( 5, 7 ) ) - 1 ] + " "
                + parseInt( song.release_date.substring( 8, 10 ) ) + ", "
                + song.release_date.substring( 0, 4 );
                document.getElementById( "releaseDate" ).style.display = "inline";
                document.getElementById( "releaseDateTag" ).style.display = "inline";
            }

            for( var i = 0; i < song.producer_artists.length; i++ )
            {
                document.getElementById( "producers" ).innerHTML += "• " + externalLinkBuilder( song.producer_artists[i].name, song.producer_artists[i].url ) + "<br>";
                document.getElementById( "producerList" ).style.display = "block";
                document.getElementById( "producers" ).style.display = "block";
            }

            for( var i = 0; i < song.writer_artists.length; i++ )
            {
                document.getElementById( "writers" ).innerHTML += "• " + externalLinkBuilder( song.writer_artists[i].name, song.writer_artists[i].url ) + "<br>";
                document.getElementById( "writerList" ).style.display = "block";
                document.getElementById( "writers" ).style.display = "block";
            }

            for( var j = 0; j < songRelationships.length; j++ )
            {
                for( var i = 0; i < song.song_relationships[j].songs.length; i++ )
                {
                    document.getElementById( songRelationships[j] ).innerHTML += "• " + internalLinkBuilder( song.song_relationships[j].songs[i].title, song.song_relationships[j].songs[i].id ) + "<br>";
                    document.getElementById( songRelationships[j] + "List" ).style.display = "block";
                    document.getElementById( songRelationships[j] ).style.display = "block";
                }
            }
            for( var i = 0; i < song.media.length; i++ )
            {
                if( song.media[i].provider == "spotify" )
                {
                    document.getElementById( "spotifyPlayer" ).src = "https://open.spotify.com/embed?uri=spotify%3Atrack%3A" + song.media[i].url.substring( song.media[i].url.indexOf( 31 ) );
                    document.getElementById( "spotifyPlayer" ).style.display = "block";
                }
            }
        }

        var externalLinks = document.getElementsByClassName( "externalLink" );
        for( var i = 0; i < externalLinks.length; i++ )
        {
            (function()
            {
                var ln = externalLinks[i];
                ln.onclick = function()
                {
                    chrome.tabs.create( { active: false, url: ln.href } );
                };
            }
        )();
    }
    var internalLinks = document.getElementsByClassName( "internalLink" );
    for( var i = 0; i < internalLinks.length; i++ )
    {
        (function()
        {
            var ln = internalLinks[i];
            ln.onclick = function()
            {
                internallyLinked = true;
                geniusSongInfo( ln.id, true );
            };
        }
    )();
    }
    document.getElementById( "nextResult" ).onclick = function()
    {
        geniusSongInfo( searchResults[ ++currentResult ], true );
    }
    document.getElementById( "previousResult" ).onclick = function()
    {
        geniusSongInfo( searchResults[ --currentResult ], true );
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
                    optionsPrompt();
                }
                else
                {
                    geniusSearch( selection[0] );
                }
            }
        );
    }
);
