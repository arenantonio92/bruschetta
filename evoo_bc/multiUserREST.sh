export COMPOSER_PROVIDERS='{
  "github": {
    "provider": "github",
    "module": "passport-github",
    "clientID": "xxxxxxxxxxxxxxx",
    "clientSecret": "yyyyyyyyyyyyyyyyyy",
    "authPath": "/auth/github",
    "callbackURL": "/auth/github/callback",
    "successRedirect": "http://localhost:4200?loggedIn=true",
    "failureRedirect": "/"
  }
}'

composer-rest-server -c admin@evoo_bc -m true
