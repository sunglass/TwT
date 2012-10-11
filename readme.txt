This code uses ajax to access the sunglass API and pull stats from your projects. 

For Development, you minght runinto cross-domain problems. if so, you can use the following command from terminal (in MAC) to open chrome w/o security measures enabled. This will allow the cross-domain ajax calls until you are ready to push to the main server, after which it will not be a problem. 

open -a Google\ Chrome --args --disable-web-security

see below for more info on cross-domain
http://stackoverflow.com/questions/12523260/cross-domain-error-with-chrome-in-local-dev-only-how-to-resolve
http://peter.sh/experiments/chromium-command-line-switches/