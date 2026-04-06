  local isClosed = false
    
    function onInteract(self, createdInteraction)
        print("item: Has interactuado conmigo")
    end
    
    function onStart(entity)
        print("Item en el onStart")
    end

  function onUpdate(entity, deltaTime)
  
    if Session:has("isDialogClosed") and not isClosed then
      isClosed = true
      print("El dialogo se ha cerrado y lo se por la memoria, Soy EL item")
    end
  end