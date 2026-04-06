#include <gtest/gtest.h>
#include <sol/sol.hpp>
#include <string>
#include "SessionManager.h"

class SessionManagerTest : public ::testing::Test {
protected:
    // EL ORDEN IMPORTA:
    // Las variables se destruyen en orden inverso a su declaración.
    // Declaramos 'lua' PRIMERO para que se destruya ÚLTIMO.
    sol::state lua;
    SessionManager session;

    void SetUp() override {
        lua.open_libraries(sol::lib::base);
    }

    void TearDown() override {
        // Forzamos la limpieza de los sol::object antes de que termine el test
        // Esto garantiza que no queden referencias colgando.
        session.clear();
    }
};

TEST_F(SessionManagerTest, InitiallyEmptyAndDoesNotHaveKeys) {
    EXPECT_FALSE(session.has("player_health"));
}

TEST_F(SessionManagerTest, GetReturnsNilForNonExistentKeys) {
    sol::object result = session.get("non_existent_key", lua.lua_state());
    EXPECT_TRUE(result.is<sol::lua_nil_t>());
}

TEST_F(SessionManagerTest, SetAndGetPrimitiveTypes) {
    session.set("player_name", sol::make_object(lua, "Inkih"));
    session.set("player_score", sol::make_object(lua, 999));

    sol::object nameResult = session.get("player_name", lua.lua_state());
    EXPECT_EQ(nameResult.as<std::string>(), "Inkih");
    EXPECT_EQ(session.get("player_score", lua.lua_state()).as<int>(), 999);
}

TEST_F(SessionManagerTest, SetOverwritesExistingKeys) {
    session.set("health", sol::make_object(lua, 100));
    session.set("health", sol::make_object(lua, "Full"));

    sol::object result = session.get("health", lua.lua_state());
    EXPECT_EQ(result.as<std::string>(), "Full");
}

TEST_F(SessionManagerTest, RemoveDeletesSpecificKey) {
    session.set("key_1", sol::make_object(lua, "A"));
    session.remove("key_1");
    EXPECT_FALSE(session.has("key_1"));
}

TEST_F(SessionManagerTest, ClearEmptiesTheEntireSession) {
    session.set("gold", sol::make_object(lua, 50));
    session.clear();
    EXPECT_FALSE(session.has("gold"));
}

TEST_F(SessionManagerTest, StoreAndRetrieveLuaTable) {
    lua.script("test_table = { items = 5, name = 'bag' }");
    sol::object luaTable = lua["test_table"];
    session.set("inventory", luaTable);

    sol::object retrieved = session.get("inventory", lua.lua_state());
    ASSERT_TRUE(retrieved.is<sol::table>());
    sol::table t = retrieved.as<sol::table>();

    EXPECT_EQ(t["items"].get<int>(), 5);
}