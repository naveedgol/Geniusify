function authenticate()
{
    document.getElementById( "loginResponse" ).style.display = "none";
    document.getElementById( "loader" ).style.display = "block";

    var authUrl = "https://api.genius.com/oauth/authorize?client_id=fqHI7GwYDkwht665RsE6Yq0M1CE8UzGLp2EuBN2uFxExtFZI_WTdtelJjNfJ56QD&redirect_uri="
                  + chrome.identity.getRedirectURL() + "&scope=me&response_type=token";

    chrome.identity.launchWebAuthFlow(
        { url: authUrl, interactive: true },
        function( responseUrl )
        {
            var accessToken = responseUrl.substring( responseUrl.indexOf( "=" ) + 1, responseUrl.indexOf( "&" ) );
            if( accessToken == "access_denied" )
            {
                document.getElementById( "loginResponse" ).innerHTML = "Please try again.";
            }
            else
            {
                chrome.storage.sync.set(
                    { 'accessToken': accessToken },
                    function( result )
                    {
                        document.getElementById( "loginResponse" ).innerHTML = "Login succeeded!";
                    }
                );
            }
            document.getElementById( "loader" ).style.display = "none";
            document.getElementById( "loginResponse" ).style.display = "block";
        }
    );
}

document.getElementById('loginButton').addEventListener( 'click', authenticate );
