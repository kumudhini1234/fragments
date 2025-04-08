# tests/integration/lab-9-s3.hurl

# 1. POST a new text fragment
POST http://fragments-lb-240530837.us-east-1.elb.amazonaws.com/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`Hello S3!`

HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# 2. GET fragment info
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.size" == 9
jsonpath "$.fragment.type" == "text/plain"

# 3. POST a second fragment (JSON)
POST http://fragments-lb-240530837.us-east-1.elb.amazonaws.com/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1

{"service": "S3"}

HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# 4. GET all fragments
GET http://fragments-lb-240530837.us-east-1.elb.amazonaws.com/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"

# 5. DELETE first fragment
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# 6. Verify deletion
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

# 7. Verify fragment list after deletion
GET http://fragments-lb-240530837.us-east-1.elb.amazonaws.com/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" not contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"