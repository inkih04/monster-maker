local speed = 2
local cameraSmoothing = 0.15

function onCollision(collidedEntity)
    print("OnCollision called in player move component")
end

function onStart(entity)
    Audio:setMusicVolume(0.02)
    Audio:setMasterVolume(0.02)
    Audio:playMusic("resources/music/music_overworld.mp3", true)
    local posComp = entity:getPos()
    if posComp and MainCamera then
        MainCamera:setPosition(posComp.x, posComp.y)
    end
    print("Player Move Component Started")
end

function onUpdate(entity)
    local posComp = entity:getPos()
    local moveComp = entity:getMove()

    if not posComp or not moveComp then return end

    local newX = posComp.x
    local newY = posComp.y

    if Input:isKeyDown(Keys.UP) or Input:isKeyDown(Keys.W) then
        newY = newY - speed
    elseif Input:isKeyDown(Keys.DOWN) or Input:isKeyDown(Keys.S) then
        newY = newY + speed
    elseif Input:isKeyDown(Keys.LEFT) or Input:isKeyDown(Keys.A) then
        newX = newX - speed
    elseif Input:isKeyDown(Keys.RIGHT) or Input:isKeyDown(Keys.D) then
        newX = newX + speed
    end

    moveComp:move(Position.new(newX, newY))

    if Input:isKeyPressed(Keys.Z) then
        entity:interact()
    end

    if MainCamera then
        local halfW = MainCamera:getWidth()  / 2
        local halfH = MainCamera:getHeight() / 2
        local clamped = Borders:clampCamera(Position.new(newX, newY), halfW, halfH)
        MainCamera:lerpTo(clamped.x, clamped.y, cameraSmoothing)
    end
end
