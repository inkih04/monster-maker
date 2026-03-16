//
// Created by inkih on 16/3/26.
//

#ifndef MONSTERMAKERENGINE_UIDOCUMENTLOADER_H
#define MONSTERMAKERENGINE_UIDOCUMENTLOADER_H

#include <GL/glew.h>
#include <string>
#include <optional>
#include <RmlUi/Core.h>

struct UiDocumentDef {
    std::string htmlPath;
    std::string cssPath;
    std::optional<std::string> scriptPath;
};

class UiDocumentLoader {
public:
    static UiDocumentDef loadDef(const std::string& uiFilePath);
};

#endif //MONSTERMAKERENGINE_UIDOCUMENTLOADER_H