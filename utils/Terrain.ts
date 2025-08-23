import { Vec2, Circle, Box } from 'planck'

import { random } from 'lodash'

const generateCircle = (world, radius, density, x, y) => {
  var body = world.createDynamicBody(Vec2(x, y))

  var fd = {
    density: density,
    friction: 0.1,
  }

  body.createFixture(new Circle(radius), fd)

  return body
}

const generateBox = (world, width, height, density, x, y) => {
  var body = world.createDynamicBody(Vec2(x, y))

  var fd = {
    density: density,
    friction: 0.1,
  }

  body.createFixture(new Box(width, height), fd)

  return body
}

const createObstacle = (world, x, y1, y2) => {
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

    return circle
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

    return box
  }
}

export { createObstacle }
