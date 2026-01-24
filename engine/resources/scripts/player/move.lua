local speed = 2
local cameraSmoothing = 0.15


function onStart(entity)
    local posComp = entity:getPos()
    if posComp and MainCamera then
        MainCamera:setPosition(posComp.x, posComp.y)
        print("Camera centered on Start at: " .. posComp.x .. ", " .. posComp.y)
    end
    print("Player Move Component Started")
end


function onUpdate(entity)
    local posComp = entity:getPos()
    local moveComp = entity:getMove()

    if not posComp or not moveComp then return end

    local newX = posComp.x
    local newY = posComp.y

    if Input:isKeyDown(Keys.W) then
        newY = newY - speed
    elseif Input:isKeyDown(Keys.S) then
        newY = newY + speed
    elseif Input:isKeyDown(Keys.A) then
        newX = newX - speed
    elseif Input:isKeyDown(Keys.D) then
        newX = newX + speed
    end
    moveComp:move(Position.new(newX, newY, posComp.rotation))

    if MainCamera then
        MainCamera:lerpTo(newX, newY, cameraSmoothing)
    end
end