function initialize (me)
  while (true)
  do
	bot_main(me)
  end
end

a = 0
my_pos = vec.new(0, 0)
dir = vec.new(1, 0)

function bot_init (me)
  math.randomseed(os.clock()*10000)
end

function bot_main (me)
  my_pos = me:pos()
  dir = dir:add(vec.new(math.random(0, 10) - 5, math.random(0, 10) - 5))
  me:move(dir)
  a = a + 1
  entities = me:visible()
  for _, ent in ipairs(entities) do
    me:cast(0, ent:pos():sub(my_pos))
    me:cast(1, ent:pos():sub(my_pos))
    me:cast(2, ent:pos():sub(my_pos))
  end
end
