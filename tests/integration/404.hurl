# request a route that doesn't exist
GET http://fragments-lb-240530837.us-east-1.elb.amazonaws.com/no-such-route

# We should get back an HTTP 1.1 404 response
HTTP/1.1 404
