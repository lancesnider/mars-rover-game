import { Rive, Fit, Alignment, Layout } from "@rive-app/webgl2";
import { createScene } from "./GamePhysics";
import { set } from "lodash";

const el = document.getElementById("rive-canvas");

const { testbed, world, carBodies } = createScene()

testbed.start(world)

let modelValues = {}

// Set the transforms for the model instance
// based on the body position and angle
const setTransforms = (body, modelInstance, bodyX, bodyY) => {
  const postion = body.getPosition()
  modelInstance.x.value = postion.x * 100 - bodyX
  modelInstance.y.value = postion.y * -100 - bodyY
  modelInstance.r.value = -body.getAngle()
}

// Get the terrian properties from the physics
const getTerrainProperties = (instance) => {
  return instance.properties.reduce((acc, property) => {
    const propName = property.name

    return {
      ...acc,
      [propName]: instance.number(propName)
    }

  }, {})
}

async function main() {
  const r = new Rive({
    src: 'race_car.riv',
    autoplay: true,
    canvas: el,
    autoBind: true,
    layout: new Layout({
      fit: Fit.Layout,
      layoutScaleFactor: .5
    }),
    artboard: "MAIN",
    stateMachines: 'State Machine 1',
    onLoad: () => {
      const instance = r.viewModelInstance


      modelValues = instance.properties.reduce((acc, property) => {
        const propName = property.name

        if (propName === "body" || propName.startsWith("wheel ")) {
          return {
            ...acc,
            [propName]: {
              x: instance.viewModel(propName).number('x'),
              y: instance.viewModel(propName).number('y'),
              r: instance.viewModel(propName).number('r'),
            }
          }
        }
      }, {})


      const terrain1Ys = getTerrainProperties(instance.viewModel("terrain 1"))
      const terrain2Ys = getTerrainProperties(instance.viewModel("terrain 2"))

      modelValues.terrain = [terrain1Ys, terrain2Ys]

      r.resizeDrawingSurfaceToCanvas();
    },
    onAdvance: () => {
      // Every time the Rive state machine advances, get the physics body positions
      const bodyPosition = carBodies.body.getPosition()

      const offsetX = r.artboardWidth / 5
      const offsetY = r.artboardHeight / 3

      const bodyX = bodyPosition.x * 100 - offsetX
      const bodyY = bodyPosition.y * -100 - offsetY

      modelValues.body.x.value = offsetX
      modelValues.body.y.value = offsetY
      modelValues.body.r.value = -carBodies.body.getAngle()

      // update the terrain x1 and y1 positions
      modelValues.terrain[0]["terrain bone x 1"].value = carBodies.terrain1.x1 * 100 - bodyX
      if (carBodies.lap > 1) {
        modelValues.terrain[1]["terrain bone x 1"].value = carBodies.terrain2.x1 * 100 - bodyX
      }

      for (let i = 1; i <= 21; i++) {
        const terrain1Y = carBodies.terrain1[`y${i}`]
        modelValues.terrain[0][`terrain bone y ${i}`].value = terrain1Y * -100 - bodyY

        if (carBodies.lap > 1) {
          const terrain2Y = carBodies.terrain2[`y${i}`]
          modelValues.terrain[1][`terrain bone y ${i}`].value = terrain2Y * -100 - bodyY
        }
      }

      setTransforms(carBodies.front, modelValues['wheel 3'], bodyX, bodyY)
      setTransforms(carBodies.middle, modelValues['wheel 2'], bodyX, bodyY)
      setTransforms(carBodies.back, modelValues['wheel 1'], bodyX, bodyY)
    }
  })

  window.addEventListener(
    "resize",
    () => {
      r.resizeDrawingSurfaceToCanvas();
    },
    false
  );

}


main()