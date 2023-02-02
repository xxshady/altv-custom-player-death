import alt from "alt-client"
import native from "natives"
import { LOCAL_PLAYER } from "./constants"

alt.onServer("playerDamageRagdoll", (forceOffset, boneId, ragdollTime) => {
  // alt.log("playerDamageRagdoll", forceOffset, boneId, ragdollTime)

  native.setPedToRagdoll(LOCAL_PLAYER, ragdollTime, ragdollTime, 0, false, false, true)
  
  if (forceOffset) {
    const boneIndex = native.getPedBoneIndex(LOCAL_PLAYER, boneId)

    alt.nextTick(() => {
      native.applyForceToEntity(
        LOCAL_PLAYER,
        1,
        forceOffset.x,
        forceOffset.y,
        forceOffset.z,
        0,
        0,
        0,
        boneIndex,
        false,
        false,
        false,
        false,
        false,
      )
    })
  }
})
