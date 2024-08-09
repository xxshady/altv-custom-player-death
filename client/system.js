import alt from "alt-client"
import native from "natives"
import { PLAYER_CUSTOM_HEALTH_SYNC_KEY } from "../shared.js"
import { shuffleArray } from "./helpers.js"
import { LOCAL_PLAYER } from "./constants.js"
import "./facial-anim-sync.js"
import "./damage-ragdoll.js"

const BLOOD_DAMAGE_PACKS = [
  "Explosion_Med", "BigHitByVehicle", "SCR_Torture",
  "Skin_Melee_0", "Fall",
]

alt.everyTick(() => {
  // disables instant death if player falls from a great height
  native.setDisableHighFallDeath(LOCAL_PLAYER, true)
  // disables instant death inside vehicle if it is blown up
  native.setPedConfigFlag(LOCAL_PLAYER, 407, true)
})

let deathTick = null

// for external usage
const stopDeath = () => {
  deathTick?.destroy()
  deathTick = null

  native.setPlayerInvincibleButHasReactions(LOCAL_PLAYER, false)
  for (let i = 0; i <= 6; ++i) {
    native.clearPedDamageDecalByZone(LOCAL_PLAYER, i, "ALL")
  }
}

const startDeath = () => {
  // alt.log("playerDeathStart")

  if (!native.isEntityInWater(LOCAL_PLAYER)) {
    // TEST
    // shuffleArray(BLOOD_DAMAGE_PACKS)
    BLOOD_DAMAGE_PACKS
      // .slice(0, 3)
      .forEach(e => native.applyPedDamagePack(LOCAL_PLAYER, e, 100.0, 1.0))
  }

  deathTick = new alt.Utils.EveryTick(() => {
    native.resetPedRagdollTimer(LOCAL_PLAYER)
    native.setPedToRagdoll(LOCAL_PLAYER, 500, 500, 0, false, false, false)

    // TODO: find a way to throw the player out of the vehicle
    // temp shit-fix for death in closed vehicle
    if (LOCAL_PLAYER.vehicle)
      native.taskLeaveAnyVehicle(LOCAL_PLAYER, 0, 256) // don't close the vehicle door
  })

  // making player invincible so he cant be *really* killed
  // though playerDeath listener on the serverside would not be redundant for edge cases
  // (we don't use serverside setter because it sets invincibility without dead body reactions)
  native.setPlayerInvincibleButHasReactions(LOCAL_PLAYER, true)

  alt.emit("customPlayerDeath")
}

alt.onServer("playerDeathStart", startDeath)
alt.onServer("playerDeathStop", stopDeath)

// TODO: fix death ragdoll of remote player ped from high fall
// // force ragdoll on remote player death
// alt.on("streamSyncedMetaChange", (player, key, value, oldValue) => {
//   if (player === LOCAL_PLAYER) return
//   if (!(player instanceof alt.Player)) return
//   if (key !== PLAYER_CUSTOM_HEALTH_SYNC_KEY) return
//   if (!(player.isSpawned)) return // altv stream synced meta bug workaround
//   if (value > 0) return

//   alt.log("force fall player:", player.name)
//   alt.everyTick(() => {
//     native.setPedCanRagdoll(player, true)
//     native.setPedToRagdoll(player, 1000, 1000, 0, false, false, false)
//   })
//   native.applyForceToEntity(
//     player,
//     1,
//     0, 0, -5.0,
//     0, 0, 0,
//     0,
//     false, true, true, true, true,
//   )
// })

// custom health value in range 0-100
export const getPlayerCustomHealth = (player) => {
  return player.getStreamSyncedMeta(PLAYER_CUSTOM_HEALTH_SYNC_KEY)
}
