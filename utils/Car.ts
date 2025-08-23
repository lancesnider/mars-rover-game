import { Vec2, Circle, WheelJoint, Box, Body } from 'planck'

// wheel spring settings
const HZ = 2.4
const ZETA = 0.5
const wheelFD = {
  density: 1.0,
  friction: 0.9,
}
const maxMotorTorque = 15

const createCar = (world) => {
  /*
    Car Body
  */

  const car = world.createDynamicBody(Vec2(0.05, 2))

  // The vehicle body is made up of 4 box fixtures
  // Main body
  car.createFixture(new Box(1.5, 0.5), 1.0)
  // Motor (in the back)
  car.createFixture(Box(0.8, 0.5, Vec2(-1.4, 0.35), -0.5), 0.5)
  // Head
  car.createFixture(Box(0.3, 0.3, Vec2(1.2, 2)), 1.0)
  // Grabber arm
  car.createFixture(Box(0.5, 0.7, Vec2(2.1, 0.3)), 0.5)

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

  const springBack = world.createJoint(
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

  const springMiddle = world.createJoint(
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

  const springFront = world.createJoint(
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
    springFront,
  }
}

export { createCar }
