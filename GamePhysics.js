import {
  World,
  Testbed,
  Vec2,
  Edge,
  Circle,
  WheelJoint,
  Box,
} from 'planck/dist/planck-with-testbed'
import { createCar } from './utils/Car'
import { createObstacle } from './utils/Terrain'

import { random } from 'lodash'


var SPEED = 80.0

// Ground settings
var groundFD = {
  density: 0.0,
  friction: 0.6,
}

// Keep track of the last terrain position
// This is used to create new ground segments
// that connect to the last segment
const lastTerrainPosition = { x: -10, y: 0 }

const carBodies = {
  lap: 0,
  terrain1: {},
  terrain2: {}
}


var lap = 0 // current lap
// number of times we make new ground
const segmentsPerLap = 20 // number of segments per lap. If this changes, you need to update the Rive.
const dx = 5.0 // distance between segments

// When an object (ground/obstacles) was created 2 laps ago, we can destroy it
const destroyOnLap = []
const destroyBodies = (world, bodies) => {
  // destroy all bodies in array
  bodies.forEach((body) => {
    destroyBody(world, body)
  })

  // remove first element of array
  destroyOnLap.shift()
}

// Destroy a single body
const destroyBody = (world, body) => {
  if (world && body) {
    world.destroyBody(body)
  }
}

// Create a new lap and generate new ground
const createLap = (world) => {
  console.log('creating new lap')
  const newGround = generateGround(world, lap)
  destroyOnLap.push(newGround)

  // Destroy old ground segments
  if (destroyOnLap.length > 2) {
    destroyBodies(world, destroyOnLap[0])
  }

  lap += 1
  carBodies.lap = lap
}

// Generate ground segments
const generateGround = (world, lap) => {
  const toDestroy = []

  // Create a new ground body
  var ground = world.createBody()


  var x = lastTerrainPosition.x,
  y1 = lastTerrainPosition.y

  const currentTerrain = carBodies[lap % 2 === 0 ? "terrain1" : "terrain2"]
  currentTerrain["x1"] = x

  // Create a new ground segments
  for (var i = 0; i < segmentsPerLap; ++i) {
    // The first 5 segements are flat
    const y2 = lap === 0 && i < 5 ? -7 : random(-3.0, 2.0)

    ground.createFixture(new Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD)

    currentTerrain[`y${i + 1}`] = y1

    y1 = y2
    x += dx

    // Generate random square and circle obstacles
    // const obstacle = createObstacle(world, x, y1, y2)
    // toDestroy.push(obstacle)

    // If this is the last segment, save the position
    if (i === segmentsPerLap - 1) {
      lastTerrainPosition.x = x
      lastTerrainPosition.y = y2

      currentTerrain[`y${i + 2}`] = y2
    }
  }

  toDestroy.push(ground)

  return toDestroy
}

const createScene = () => {
  let world = new World({
    gravity: new Vec2(0.0, -10.0),
  })

  const testbed = Testbed.mount()
  testbed.x = 0
  testbed.y = 0
  testbed.ratio = 40
  // Viewbox size
  testbed.width = 30
  testbed.height = 20

  createLap(world)

  /*
    Vehicle
  */

  const {
    wheelBack,
    wheelMiddle,
    wheelFront,
    car,
    springBack,
    springMiddle,
    springFront
  } = createCar(world)

  carBodies.back = wheelBack
  carBodies.middle = wheelMiddle
  carBodies.front = wheelFront
  carBodies.body = car

  /*
    Controls
  */

  testbed.step = function () {
    if (!springBack || !springFront || !springMiddle) return

    if (testbed.activeKeys.left) {
      // Apply torque for left turn (counter-clockwise)
      car.applyTorque(100, true)
    } else if (testbed.activeKeys.right) {
      // Apply torque for right turn (clockwise)
      car.applyTorque(-100, true)
    }

    if (testbed.activeKeys.up && testbed.activeKeys.down) {
      springBack.setMotorSpeed(0)
      springBack.enableMotor(false)
      springMiddle.setMotorSpeed(0)
      springMiddle.enableMotor(false)
      springFront.setMotorSpeed(0)
      springFront.enableMotor(false)
    } else if (testbed.activeKeys.up) {
      const speed = -SPEED

      springBack.setMotorSpeed(speed)
      springBack.enableMotor(true)
      springMiddle.setMotorSpeed(speed)
      springMiddle.enableMotor(true)
      springFront.setMotorSpeed(speed)
      springFront.enableMotor(true)
    } else if (testbed.activeKeys.down) {
      const speed = +SPEED

      springBack.setMotorSpeed(speed)
      springBack.enableMotor(true)
      springMiddle.setMotorSpeed(speed)
      springMiddle.enableMotor(true)
      springFront.setMotorSpeed(speed)
      springFront.enableMotor(true)
    } else {
      springBack.setMotorSpeed(0)
      springBack.enableMotor(false)
      springMiddle.setMotorSpeed(0)
      springMiddle.enableMotor(false)
      springFront.setMotorSpeed(0)
      springFront.enableMotor(false)
    }

    var cp = car.getPosition()
    testbed.x = cp.x + 8
    testbed.y = -cp.y - 3

    if (cp.x > lap * dx * segmentsPerLap - 50) {
      createLap(world)
    }
  }

  return { world, testbed, carBodies }
}

export { createScene }