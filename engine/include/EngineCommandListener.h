//
// Created by inkih on 7/4/26.
//

#ifndef MONSTERMAKERENGINE_ENGINECOMMANDLISTENER_H
#define MONSTERMAKERENGINE_ENGINECOMMANDLISTENER_H

#include <atomic>
#include <thread>
#include <string>

class EngineCommandListener {
public:
    static void start();
    static void stop();

    static bool isPaused();

private:
    static void listenLoop();

    static std::atomic<bool> s_paused;
    static std::atomic<bool> s_running;
    static std::thread       s_thread;
};

#endif //MONSTERMAKERENGINE_ENGINECOMMANDLISTENER_H
