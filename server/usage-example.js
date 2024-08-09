import alt from "alt-server"
import { spawnPlayer, events } from "./system.js"

alt.on("playerConnect", (player) => {
  alt.log("playerConnect", player.name)
  player.spawn("mp_m_freemode_01", new alt.Vector3(0, 0, 70));
  spawnPlayer(player)
})

alt.onClient("respawnPlayer", (player) => {
  if (!player.customDead) {
    alt.logWarning("respawnPlayer received from non dead player")
    return
  }

  alt.log("respawnPlayer", player.name)

  spawnPlayer(player)
})

// player, killer or null, weapon or null
events.onDeath = (player, killer, weapon) => {
  alt.log('onDeath', player.name, killer?.name, weapon);
}
