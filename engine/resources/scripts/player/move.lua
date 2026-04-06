local speed = 2
local cameraSmoothing = 0.15


function onCollision(collidedEntity)
    print("OnCollision called in player move component")
end

function onStart(entity)

    Audio:setMusicVolume(0.02)
    Audio:setMasterVolume(0.02)
    Audio:playMusic("resources/music/music_overworld.mp3", true)

    Save:load("save_test.json")
    local savedX = Save:get("player_x")
    local savedY = Save:get("player_y")
    local moveComp = entity:getMove()
    if savedX ~= nil and savedY ~= nil and moveComp then
        moveComp:move(Position.new(savedX, savedY))
    end

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

    local hasMoved = moveComp:move(Position.new(newX, newY))

    -- Z: abrir diálogo en primera pulsación, avanzar en las siguientes
    if Input:isKeyPressed(Keys.Z) then
     entity:interact()

    end

    if Input:isKeyPressed(Keys.P) then
        Save:set("player_x", posComp.x)
        Save:set("player_y", posComp.y)
        local success = Save:commit("save_test.json")
        print(success and "¡Posición guardada!" or "Error al guardar.")
    end

    if MainCamera and hasMoved then
        local halfW = MainCamera:getWidth()  / 2
        local halfH = MainCamera:getHeight() / 2
        local clamped = Borders:clampCamera(Position.new(newX, newY), halfW, halfH)
        MainCamera:setPosition(clamped.x, clamped.y)
    end
end