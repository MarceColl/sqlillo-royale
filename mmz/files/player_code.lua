function bot_init (me)
  math.randomseed(os.clock()*10000)
end

function bot_main (me)
  entities = me:visible()
  for _, ent in ipairs(entities) do
    if ent then
      print(ent)
      me:cast(0, vec.new(1, 0))
    end
  end
end
