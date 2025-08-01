import {
  World,
  Testbed,
  Vec2,
  Edge,
  Circle,
  WheelJoint,
  Box,
} from 'planck/dist/planck-with-testbed'

import { random } from 'lodash'

// wheel spring settings
var HZ = 2.4
var ZETA = 0.5
var SPEED = 80.0

// Ground settings
var groundFD = {
  density: 0.0,
  friction: 0.6,
}

// Keep track of the last terrain position
// This is used to create new ground segments
// that connect to the last segment
const lastTerrainPosition = { x: 20, y: 0 }


// number of times we make new ground
var lap = 0 // current lap
const segmentsPerLap = 20 // number of segments per lap
const dx = 5.0 // distance between segments

// When an object (ground/obstacles) was created 2 laps ago, we can destroy it
const destroyOnLap = []
const destroyBodies = (world, bodies) => {
  // destroy all bodies in array
  console.log('destroying lap bodies')
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
  const objectsToDestroy = generateGround(world)
  destroyOnLap.push(objectsToDestroy)

  if (destroyOnLap.length > 2) {
    destroyBodies(world, destroyOnLap[0])
  }

  lap += 1
}

// Generate ground segments
const generateGround = (world) => {
  const toDestroy = []

  // Create a new ground body
  var ground = world.createBody()

  var x = lastTerrainPosition.x,
    y1 = lastTerrainPosition.y

  // Create a new ground segments
  for (var i = 0; i < segmentsPerLap; ++i) {
    const y2 = random(-3.0, 2.0)
    ground.createFixture(new Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD)
    y1 = y2
    x += dx

    // 1 in 5 chance of generating a circle
    const randomObstacle = random(0, 10)
    if (randomObstacle <= 1) {
      const randomRadus = random(0.3, 1.3)
      const circle = generateCircle(
        world,
        randomRadus,
        1.0,
        x + 2.5,
        Math.max(y1, y2) + randomRadus
      )

      toDestroy.push(circle)
    } else if (randomObstacle == 2) {
      const randomSize = random(0.3, 1)
      const box = generateBox(
        world,
        randomSize,
        randomSize,
        randomSize,
        x + 2.5,
        Math.max(y1, y2) + 3
      )

      toDestroy.push(box)
    }

    // If this is the last segment, save the position
    if (i === segmentsPerLap - 1) {
      lastTerrainPosition.x = x
      lastTerrainPosition.y = y2
    }
  }

  toDestroy.push(ground)

  return toDestroy
}

const generateCircle = (
  world,
  radius,
  density,
  x,
  y
) => {
  var body = world.createDynamicBody(Vec2(x, y))

  var fd = {
    density: density,
    friction: 0.1,
  }

  body.createFixture(new Circle(radius), fd)

  return body
}

const generateBox = (
  world,
  width,
  height,
  density,
  x,
  y
) => {
  var body = world.createDynamicBody(Vec2(x, y))

  var fd = {
    density: density,
    friction: 0.1,
  }

  body.createFixture(new Box(width, height), fd)

  return body
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


  // Create the initial ground segment
  var ground = world.createBody()
  ground.createFixture(new Edge(Vec2(-20.0, 0.0), Vec2(20.0, 0.0)), groundFD)

  createLap(world, ground)

  /*
    TruVehicleck
  */

  // Vehicle body
  var car = world.createDynamicBody(Vec2(0.05, 2))
  const carBodyF = car.createFixture(
    new Box(1.5, .5),
    1.0
  )

  car.createFixture(
    Box(0.8, 0.5, Vec2(-1.4, 0.35), -.5),
    .5
  );

  car.createFixture(
    Box(0.3, 0.3, Vec2(1.2, 2)),
    1.0
  );

  car.createFixture(
    Box(.5, .7, Vec2(2.1, .3)),
    .5
  );

  // Add wheels
  var wheelFD = {
    density: 1.0,
    friction: 0.9,
  }

  var wheelBack = world.createDynamicBody(Vec2(-1.75, 0.5))
  const wheelBackF = wheelBack.createFixture(new Circle(0.6), wheelFD)

  var wheelMiddle = world.createDynamicBody(Vec2(0, 0.5))
  const wheelMiddleF = wheelMiddle.createFixture(new Circle(0.6), wheelFD)

  var wheelFront = world.createDynamicBody(Vec2(1.75, 0.5))
  const wheelFrontF = wheelFront.createFixture(new Circle(0.6), wheelFD)

  // Add shocks
  var springBack = world.createJoint(
    new WheelJoint(
      {
        motorSpeed: 0.0,
        maxMotorTorque: 20.0,
        enableMotor: true,
        frequencyHz: HZ,
        dampingRatio: ZETA,
      },
      car,
      wheelBack,
      wheelBack.getPosition(),
      Vec2(0.0, 1.0)
    )
  )

  var springMiddle = world.createJoint(
    new WheelJoint(
      {
        motorSpeed: 0.0,
        maxMotorTorque: 20.0,
        enableMotor: false,
        frequencyHz: HZ,
        dampingRatio: ZETA,
      },
      car,
      wheelMiddle,
      wheelMiddle.getPosition(),
      Vec2(0.0, 1.0)
    )
  )

  var springFront = world.createJoint(
    new WheelJoint(
      {
        motorSpeed: 0.0,
        maxMotorTorque: 20.0,
        enableMotor: false,
        frequencyHz: HZ,
        dampingRatio: ZETA,
      },
      car,
      wheelFront,
      wheelFront.getPosition(),
      Vec2(0.0, 1.0)
    )
  )

  const carBodies = {
    back: wheelBack,
    middle: wheelMiddle,
    front: wheelFront,
    body: car,
    springBack,
    springMiddle,
  }

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

    if (cp.x > lap * dx * segmentsPerLap - 20) {
      createLap(world)
    }
  }

  return { world, testbed, carBodies }
}

export { createScene }