-- Global variables
local target = nil
local cooldowns = {0, 0, 0}
local get_out = 0
local closest_bullet = nil
local prev_dist_bullet = math.huge
local vector_zero = vec.new(0,0)

-- Initialize bot
function bot_init(me)
end

-- Main bot function
function bot_main(me)
  local me_pos = me:pos()
  -- Update cooldowns
  for i = 1, 3 do
    if cooldowns[i] > 0 then
      cooldowns[i] = cooldowns[i] - 1
    end
  end

  -- Find the closest visible enemy and bullet // CORRECT CODE BLOCK
  local closest_enemy = nil
  local min_distance = math.huge
  local next_pos= me_pos
  for _, player in ipairs(me:visible()) do
    local dist = vec.distance(me_pos, player:pos())
    if player:type() == "player" then
      if dist < min_distance then
	min_distance = dist
	closest_enemy = player
      end
    else 
      if dist < prev_dist_bullet then
	prev_dist_bullet = dist
	closest_bullet = player
      end
    end
  end

  -- Set target to closest visible enemy
  local target = closest_enemy
  local center = vec.new(me:cod():x(),me:cod():y())
  local center_dir = center:sub(me_pos) -- Vector with direction to center

  if target then
    local direction_enem = target:pos():sub(me_pos) -- Direction to enemy, difference between enemy position and current postion

    if get_out == 1 and cooldowns[2] == 0 then --  get out after melee attack
      me:cast(1, vector_zero:sub(direction_enem))
      cooldowns[2] = 250
      get_out = 0
    else
      -- If target is within melee range and melee attack is not on cooldown, use melee attack
      if min_distance <= 2 and cooldowns[3] == 0 then
	me:cast(2, direction_enem)
	cooldowns[3] = 50
	get_out=1
	-- If target is not within melee range and projectile is not on cooldown, use projectile
      elseif cooldowns[1] == 0 then
	me:cast(0, direction_enem)
	cooldowns[1] = 1
      end
    end

    -- Move towards center
    me:move(center_dir)
  end
end
