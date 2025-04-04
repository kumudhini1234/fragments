# tests/integration/lab-10-dynamodb.hurl
#Test 1 - POST fragment 1
# 1. POST a new JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{"service": "DynamoDB"}

# First verify the basic response structure
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" exists

# Only try to capture Location if it exists
[Captures]
fragment1_id: jsonpath "$.fragment.id"
fragment1_url: header "Location"  # Add this capture

#Test 2 - GET fragment 1
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.fragment.size" == 23

#Test 3 - POST fragment 2
POST http://localhost:8080/v1/fragments
# We're sending a JSON fragment
Content-Type: text/markdown
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
`DynamoDB is **great**.`

HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

#Test 4 - GET fragment 2
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.fragment.size" == 22

#Test 5 - GET all fragment IDs
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" includes "{{fragment1_id}}"
jsonpath "$.fragments" includes "{{fragment2_id}}"

#Test 6 - DELETE fragment 1
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

#Test 7 - GET fragment 1, expect 404
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

#Test 5 - GET all fragment IDs, expect fragment 1 id to be gone
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" not includes "{{fragment1_id}}"
jsonpath "$.fragments" includes "{{fragment2_id}}"