import alt from "alt-server"
import { spawnPlayer } from "./system"

alt.on("playerConnect", (player) => {
  alt.log("playerConnect", player.name)

  // altv bug workaround
  // https://github.com/altmp/altv-issues/issues/1046
  player.dimension = player.id
  setTimeout(() => {
    spawnPlayer(player)
    player.dimension = alt.defaultDimension
  }, 2000)
})

alt.onClient("respawnPlayer", (player) => {
  if (!player.customDead) {
    alt.logWarning("respawnPlayer received from non dead player")
    return
  }

  alt.log("respawnPlayer", player.name)

  spawnPlayer(player, player.model)
})
