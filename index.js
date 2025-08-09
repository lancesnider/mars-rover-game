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

      const terrain = instance.viewModel("terrain")
      console.log('terrain', terrain.properties.length)

      modelValues = instance.properties.reduce((acc, property) => {
        const propName = property.name
        const propType = property.type

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

        const terrainYs = {}

        if (propName === "terrain") {
          // Each terrain view model property is named "terrain bone y 1"
          // there are 21 bones, one for each segment
          for (let i = 0; i < terrain.properties.length; i++) {
            const terrainName = terrain.properties[i].name
            const terrainProp = terrain.number(terrainName)
            terrainYs[terrainName] = terrainProp
          }
        }

        return {
          ...acc,
          terrain: terrainYs
      }
      }, {})


      console.log('modelValues', modelValues)
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
      modelValues.terrain["terrain bone x 1"].value = carBodies.terrain.x1 * 100 - bodyX
      // const terrainYi = carBodies.terrain.y1 * -100 - bodyY;
      // modelValues.terrain["terrain bone y 1"].value = terrainYi;

      for (let i = 1; i <= 21; i++) {
        const terrainY = carBodies.terrain[`y${i}`]

        modelValues.terrain[`terrain bone y ${i}`].value = terrainY * -100 - bodyY
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