local dialogs = nil
local dialogStarted = false
local currentChain = "before_combat"

local dialogVars = {
    speaker = "nombre_personaje",
    text    = "texto_dialogo"
}


function onStart(entity)
  dialogs = Dialog.load(tags.dialogo)
end
 
function onUpdate(entity, deltaTime)
end
 
function onDestroy(entity)
end
 
function onCollision(entity, other)
end
 
function onTriggerEnter(entity, other)
end
 
function onInteract(entity, other)
        if not dialogStarted then
            Dialog.open("dialogue_box", tags.text, dialogs[currentChain], dialogVars)
            dialogStarted = true
        else
            local finished = Dialog.advance("dialogue_box")
            if finished then
                Dialog.close("dialogue_box")
                dialogStarted = false
                currentChain = "after_combat"
            end
        end
end
