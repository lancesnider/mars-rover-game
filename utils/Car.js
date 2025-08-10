import {
  Vec2,
  Circle,
  WheelJoint,
  Box,
} from 'planck/dist/planck-with-testbed'

// wheel spring settings
var HZ = 2.4
var ZETA = 0.5
var wheelFD = {
  density: 1.0,
  friction: 0.9,
}
const maxMotorTorque = 15

const createCar = (world) => {
  /*
    Car Body
  */

  var car = world.createDynamicBody(Vec2(0.05, 2))

  // The vehicle body is made up of 4 box fixtures
  // Main body
  car.createFixture(
    new Box(1.5, .5),
    1.0
  )
  // Motor (in the back)
  car.createFixture(
    Box(0.8, 0.5, Vec2(-1.4, 0.35), -.5),
    .5
  );
  // Head
  car.createFixture(
    Box(0.3, 0.3, Vec2(1.2, 2)),
    1.0
  );
  // Grabber arm
  car.createFixture(
    Box(.5, .7, Vec2(2.1, .3)),
    .5
  );

  /*
    Wheels
  */

  const wheelBack = world.createDynamicBody(Vec2(-1.75, 0.5))
  wheelBack.createFixture(new Circle(0.6), wheelFD)

  const wheelMiddle = world.createDynamicBody(Vec2(0, 0.5))
  wheelMiddle.createFixture(new Circle(0.6), wheelFD)

  const wheelFront = world.createDynamicBody(Vec2(1.75, 0.5))
  wheelFront.createFixture(new Circle(0.6), wheelFD)

  /*
    Shocks
  */

  var springBack = world.createJoint(
    new WheelJoint(
      {
        motorSpeed: 0.0,
        maxMotorTorque: maxMotorTorque,
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
        maxMotorTorque: maxMotorTorque,
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
        maxMotorTorque: maxMotorTorque,
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

  return {
    wheelBack,
    wheelMiddle,
    wheelFront,
    car,
    springBack,
    springMiddle,
    springFront
  }
}

export { createCar }