# tests/integration/lab-9-s3.hurl
# Authenitcated post to v1/fragments (s3)
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
```Hello S3!```

# Expect HTTP 201 on successful post
HTTP/1.1 201

# Capturing URL of fragment from Location header
[Captures]
url: header "Location"

# GETting fragment from location
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Expect 200 on successful GET
HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
body == "Hello S3!"

# DELETing fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# Expect 200 on successful DELETE
HTTP/1.1 200

# GETting to check if fragment was deleted
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Expect 404 on unsuccessful GET after deletion
HTTP/1.1 404