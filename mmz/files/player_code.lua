function bot_init (me)
  math.randomseed(os.clock()*10000)
end

function bot_main (me)
  entities = me:visible()
  for _, ent in ipairs(entities) do
    print(ent.id())
    print(ent.owner_id)
  end
end
