import http.client 
import json 

for i in range(500):
    user = f"test{i+120}"
    conn = http.client.HTTPSConnection("sqlillo.dziban.net") 
    payload = {
        "username": user,
        "password": user,
        "password2": user,
    }
    payload = json.dumps(payload)
    headers = { 'Content-Type': "application/json" } 
    conn.request("POST", "/api/register", payload, headers) 
    res = conn.getresponse() 
    data = res.read() 

    data = data.decode("utf-8")
    register = json.loads(data);
    token = register['token']


    payload = "{\n\t\"code\": \"a = 0\\r\\nmy_pos = vec.new(0, 0)\\r\\ndir = vec.new(1, 0)\\r\\n\\r\\nfunction bot_init (me)\\r\\n  math.randomseed(os.clock()*10000)\\r\\nend\\r\\n\\r\\nfunction bot_main (me)\\r\\n  my_pos = me:pos()\\r\\n  dir = dir:add(vec.new(math.random(0, 10) - 5, math.random(0, 10) - 5))\\r\\n  me:move(dir)\\r\\n  a = a + 1\\r\\n  entities = me:visible()\\r\\n  for _, ent in ipairs(entities) do\\r\\n    me:cast(0, ent:pos():sub(my_pos))\\r\\n    me:cast(1, ent:pos():sub(my_pos))\\r\\n    me:cast(2, ent:pos():sub(my_pos))\\r\\n  end\\r\\nend\\r\\n\"\n}"

    headers = {
        'Content-Type': "application/json",
        'Authorization': f"Bearer {token}"
        }

    conn.request("POST", "/api/private/codes", payload, headers)
