//
// Created by inkih on 21/3/26.
//

#ifndef MONSTERMAKERENGINE_RMLFILEINTERFACE_H
#define MONSTERMAKERENGINE_RMLFILEINTERFACE_H

#include <RmlUi/Core/FileInterface.h>
#include <cstdio>

class RmlFileInterface : public Rml::FileInterface {
public:
    Rml::FileHandle Open(const Rml::String& path) override {
        FILE* fp = fopen(path.c_str(), "rb");
        return (Rml::FileHandle)fp;
    }

    void Close(Rml::FileHandle file) override {
        fclose((FILE*)file);
    }

    size_t Read(void* buffer, size_t size, Rml::FileHandle file) override {
        return fread(buffer, 1, size, (FILE*)file);
    }

    bool Seek(Rml::FileHandle file, long offset, int origin) override {
        return fseek((FILE*)file, offset, origin) == 0;
    }

    size_t Tell(Rml::FileHandle file) override {
        return (size_t)ftell((FILE*)file);
    }
};

#endif //MONSTERMAKERENGINE_RMLFILEINTERFACE_H