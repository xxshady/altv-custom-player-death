import alt from "alt-server"
import { spawnPlayer } from "./system"

alt.on("playerConnect", (player) => {
  alt.log("playerConnect", player.name)
})

alt.onClient("respawnPlayer", (player) => {
  if (!player.customDead) {
    alt.logWarning("respawnPlayer received from non dead player")
    return
  }

  alt.log("respawnPlayer", player.name)

  spawnPlayer(player, player.model)
})
