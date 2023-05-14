local num_players
local positions={}
local num_directions=32
local directions={}
local center
local radius

--Paràmetres:
local close_player=50
local mid_player=20
local close_wall=10
local close_bullet=70
local mid_bullet=30

function find_directions(me)
    local i=0;
    while i<num_directions do
        i=i+1
        directions[i]=vec.new(math.cos(360*i/num_directions), math.sin(360*i/num_directions))
    end
end

function bot_init(me)
    find_directions(me)
end

function len(vec)
    return math.sqrt(vec:x() * vec:x() + vec:y() * vec:y())
end

function mult(v, num)
    return vec.new(v:x()*num, v:y()*num)
end

function substract(v,w)
    return vec.new(v:x()-w:x(), v:y()-w:y())
end

function add(v,w)
    return vec.new(v:x()+w:x(), v:y()+w:y())
end

function auto_hit(me)
    local me_pos = me:pos()
    -- Find the closest visible enemy
    local closest_enemy = nil
    local min_distance = 3
    for _, player in ipairs(me:visible()) do
        local dist = vec.distance(me_pos, player:pos())
        if dist < min_distance and player:type()=="player" and dist>0 then
            min_distance = dist
            closest_enemy = player
        end
    end

    -- Set target to closest visible enemy
    local target = closest_enemy
    if target then
        
        -- If target is within melee range and melee attack is not on cooldown, use melee at
        if min_distance <= 2 and me:cooldown(2) == 0 and player:id()~=me:id() then
            local direction = substract(target:pos(),me_pos)
            me:cast(2, direction)
        -- If target is not within melee range and projectile is not on cooldown, use projec
        elseif me:cooldown(0)==0 then
            local direction=substract(center,me_pos)
            me:cast(0, direction)
        end
    end
end


function update_positions(me)
    for _, player in pairs(me:visible()) do
        if player:type()=="small_proj" then
            local id=player:id()*2
            positions[id+1]=positions[id]
            positions[id]=vec.new(player:pos():x(), player:pos():x())
        end
    end
end


function can_move(position)
    for _, player in pairs(me:visible()) do
        if player:type()=="small_proj" then
            local id=player:id()
            if vec.distance(pos, substract(add(positions[2*id],positions[2*id]), positions[2*id+1]))<1 then
                return false
            end
        elseif player:type()=="wall" then
            if vec.distance(position,player:pos())<3 then
                return false
            end
        end
    end
end

function value(position)
    local value=0
    if vec.distance(position, center) >= radius then
        value = -vec.distance(position, center)*100
    end
    for _, player in pairs(me:visible()) do
        if player:type()=="player" then 
            if vec.distance(player:pos(), position) <=7 then
                value = value-close_player
            elseif vec.distance(player:pos(), position) <=30 then
                value = value-mid_player
            end
        elseif player:type()=="wall" and vec.distance(player:pos(), position) <=10 then
            value=value+close_wall
        elseif player:type()=="small_proj" then
            if vec.distance(player:pos(), position) <=5 then
                value = value-close_bullet
            elseif vec.distance(player:pos(), position) <=25 then
                value = value-mid_bullet
            end
        end
    end
end

function optimum_movement(me)
    local i=0
    local max_value=value(me.pos())
    local choosen_direction=vec.new(0,0)
    while i<num_directions do
        i=i+1
        if can_move(directions[i]) then
            local value=value(add(me:pos(), directions[i]))
            if value > max_value then
                choosen_direction=directions[i]
                max_value=value
            end
        end
    end
end

function bot_main(me)
    if me:cod():x() == -1 then
        center=vec.new(250,250)
        radius=200
    else 
        center=vec.new(me:cod():x(),me:cod():x())
        radius=me:cod():radius()
    end
    update_positions(me)

    optimum_movement(me)
    
    auto_hit(me)  

    --count number of players alive
    local num_players=1
    for _, player in pairs(me:visible()) do
        if player:type()=="player" and player:id()~=me:id() then
            num_players = num_players +1
        end
    end
    print("###NUMBER OF PLAYERS STILL ALIVE (bot)==",num_players)
end
