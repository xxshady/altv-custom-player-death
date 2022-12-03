import alt from "alt-client"
import native from "natives"
import { getPlayerCustomHealth, stopDeath } from "./system"

const LOCAL_PLAYER = alt.Player.local

// destroyable death controllers
let deathControllers = []

const deathEnd = () => {
  deathControllers.forEach(e => e.destroy())
  deathControllers = []

  stopDeath()
  alt.emitServerRaw("respawnPlayer")
}

alt.on("customPlayerDeath", () => {
  const text = alt.Utils.drawText2d("press ~g~E~w~ to respawn")

  // KeyCode.E
  const keybind = new alt.Utils.Keybind(69, () => {
    alt.log("pressed E")
    deathEnd()
  })

  deathControllers.push(text, keybind)
})

// hiding health and armour for displaying our custom health value and not some big weird value
const hideHealthAndArmourBars = () => {
  alt.beginScaleformMovieMethodMinimap("SETUP_HEALTH_ARMOUR")
  native.scaleformMovieMethodAddParamInt(3)
  native.endScaleformMovieMethod()
}
hideHealthAndArmourBars()

// custom health ""bars""
new alt.Utils.EveryTick(() => {
  alt.Utils.drawText2dThisFrame(
    `health: ~g~${getPlayerCustomHealth(LOCAL_PLAYER)}`,
    { x: 0.5, y: 0.95 },
    // GameFont.Pricedown
    7,
  )

  for (const player of alt.Player.streamedIn) {
    alt.Utils.drawText3dThisFrame(
      `health: ~g~${getPlayerCustomHealth(player)}`,
      player.pos,
      // GameFont.Pricedown
      7,
      0.3,
    )
  }
})
