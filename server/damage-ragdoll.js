import alt from "alt-server"

// altv enum
const BodyPart = {
  Pelvis: 0,
  LeftHip: 1,
  LeftLeg: 2,
  LeftFoot: 3,
  RightHip: 4,
  RightLeg: 5,
  RightFoot: 6,
  LowerTorso: 7,
  UpperTorso: 8,
  Chest: 9,
  UnderNeck: 10,
  LeftShoulder: 11,
  LeftUpperArm: 12,
  LeftElbow: 13,
  LeftWrist: 14,
  RightShoulder: 15,
  RightUpperArm: 16,
  RightElbow: 17,
  RightWrist: 18,
  Neck: 19,
  Head: 20,
  Unknown: -1,
}

const PED_BONE = {
  ROOT: 0,
  PELVIS: 11816,
  SPINE: 57597,
  NECK: 39317,
  HEAD: 31086,

  LEFT_EYE: 25260,
  RIGHT_EYE: 27474,

  LEFT_FOOT: 14201,
  LEFT_THIGH: 58271,
  LEFT_TOES: 2108,
  LEFT_KNEE: 46078,

  RIGHT_FOOT: 52301,
  RIGHT_THIGH: 51826,
  RIGHT_TOES: 20781,
  RIGHT_KNEE: 16335,

  LEFT_HAND: 18905,
  LEFT_FINGER1: 26610,
  LEFT_FINGER2: 26611,
  LEFT_FINGER3: 26612,
  LEFT_FINGER4: 26613,
  LEFT_FINGER5: 26614,
  LEFT_FOREARM: 61163,
  LEFT_UPPER_ARM: 45509,
  LEFT_CLAVICLE: 64729,

  RIGHT_HAND: 57005,
  RIGHT_FINGER1: 58866,
  RIGHT_FINGER2: 58867,
  RIGHT_FINGER3: 58868,
  RIGHT_FINGER4: 58869,
  RIGHT_FINGER5: 58870,
  RIGHT_FOREARM: 28252,
  RIGHT_UPPER_ARM: 40269,
  RIGHT_CLAVICLE: 10706,
}

const PED_BONE_BY_BODY_PART = {
  [BodyPart.Head]: PED_BONE.HEAD,
  // neck bone is in "head" ragdoll zone, so it's easier to call fancy headshot ragdoll
  [BodyPart.Neck]: PED_BONE.HEAD,
  [BodyPart.LeftLeg]: PED_BONE.LEFT_FOOT,
  [BodyPart.RightLeg]: PED_BONE.RIGHT_FOOT,
  [BodyPart.LeftHip]: PED_BONE.LEFT_THIGH,
  [BodyPart.RightHip]: PED_BONE.RIGHT_THIGH,
}

alt.on("weaponDamage", (attacker, player, _1, _2, _3, bodyPart) => {
  if (!(player instanceof alt.Player)) return
  // if player is dead it makes no sense to apply another ragdoll
  if (player.customDead) return

  const boneId = PED_BONE_BY_BODY_PART[bodyPart]
  if (boneId == null) return

  let forceOffset
  let ragdollTime
  if (bodyPart === BodyPart.Head) {
    const mul = Math.random() * 40 + 50

    forceOffset = player.pos
      // TODO: re-check this
      .sub(attacker.pos)
      .mul(mul)

    ragdollTime = 3000
  }
  else {
    forceOffset = null
    ragdollTime = 300
  }
  
  player.emit("playerDamageRagdoll", forceOffset, boneId, ragdollTime)
})
