#include <iostream>

#include "Application.h"
#include "DebugHelper.h"

int main(int argc, char* argv[]) {
    if (argc > 1) {
        std::cout << " Debug mode: Loading map from " << argv[1] << std::endl;
        DebugHelper::getInstance().setCurrentMap(argv[1]);
    }

    Application app = Application("Monster Maker", 800, 600);
    app.run();
    return 0;
}
