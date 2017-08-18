function authenticate()
{
    var authUrl = "https://api.genius.com/oauth/authorize?client_id=fqHI7GwYDkwht665RsE6Yq0M1CE8UzGLp2EuBN2uFxExtFZI_WTdtelJjNfJ56QD&redirect_uri="
                  + chrome.identity.getRedirectURL() + "&scope=me&state=1&response_type=token";

    chrome.identity.launchWebAuthFlow(
        { url: authUrl, interactive: true },
        function( responseUrl )
        {
            var accessToken = responseUrl.substring( responseUrl.indexOf( "=" ) + 1, responseUrl.indexOf( "&" ) );
            chrome.storage.sync.set(
                { 'accessToken': accessToken },
                function( result )
                {
                    alert( "Authenticated" );
                }
            );
        }
    );
}

document.getElementById('loginButton').addEventListener( 'click', authenticate );
