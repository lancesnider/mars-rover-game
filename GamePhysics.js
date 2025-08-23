import {
  World,
  Vec2,
  Edge,
} from 'planck'
import { createCar } from './utils/Car'
// import { createObstacle } from './utils/Terrain'

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
    const y2 = lap === 0 && i < 3 ? -2 : random(-3.0, 2.0)

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
  // track which keys are currently down
  const activeKeys = {};
  const downKeys = {};
  function updateActiveKeys(keyCode, down) {
    const char = String.fromCharCode(keyCode);
    if (/\w/.test(char)) {
      activeKeys[char] = down;
    }
    activeKeys.right = downKeys[39] || activeKeys["D"];
    activeKeys.left = downKeys[37] || activeKeys["A"];
    activeKeys.up = downKeys[38] || activeKeys["W"];
    activeKeys.down = downKeys[40] || activeKeys["S"];
  }

  window.addEventListener("keydown", function (e) {
    const keyCode = e.keyCode;
    downKeys[keyCode] = true;
    updateActiveKeys(keyCode, true);
  });
  window.addEventListener("keyup", function (e) {
    const keyCode = e.keyCode;
    downKeys[keyCode] = false;
    updateActiveKeys(keyCode, false);
  });

  /*
    Fixed time step
  */

  const FIXED_STEP = 1 / 60; // 60 Hz
  const MAX_DT = 0.05; // clamp big frame gaps (50 ms)
  const VEL_ITERS = 8;
  const POS_ITERS = 3;

  let last = performance.now();
  let acc = 0;

  function tick(now) {
    // seconds since last frame, clamped
    let dt = (now - last) / 1000;
    if (dt > MAX_DT) dt = MAX_DT;
    last = now;

    acc += dt;
    while (acc >= FIXED_STEP) {
      world.step(FIXED_STEP, VEL_ITERS, POS_ITERS);
      acc -= FIXED_STEP;
    }

     if (activeKeys.left) {
      // Apply torque for left turn (counter-clockwise)
      car.applyTorque(100, true)
    } else if (activeKeys.right) {
      // Apply torque for right turn (clockwise)
      car.applyTorque(-100, true)
    }

   if (activeKeys.up) {
      const speed = -SPEED

      springBack.setMotorSpeed(speed)
      springBack.enableMotor(true)
      springMiddle.setMotorSpeed(speed)
      springMiddle.enableMotor(true)
      springFront.setMotorSpeed(speed)
      springFront.enableMotor(true)
    } else if (activeKeys.down) {
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
     if (cp.x > lap * dx * segmentsPerLap - 50) {
      createLap(world)
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  return { carBodies }
}

export { createScene }