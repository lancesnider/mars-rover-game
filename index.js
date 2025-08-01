import { property } from "lodash";
import { Rive, Fit, Alignment, Layout } from "./canvas_single";
import { createScene } from "./GamePhysics";

const el = document.getElementById("rive-canvas");

const { testbed, world, carBodies } = createScene()

testbed.start(world)

let modelValues = {}

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
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    stateMachines: 'State Machine 1',
    onLoad: () => {
      const instance = r.viewModelInstance
      console.log(r)

      modelValues = instance.properties.reduce((acc, property) => {
        const propName = property.name
        const propType = property.type

        if (propType === "viewModel") {
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

      r.resizeDrawingSurfaceToCanvas();
    },
    onAdvance: () => {
      const bodyPosition = carBodies.body.getPosition()

      const offsetX = r.artboardWidth / 5
      const offsetY = r.artboardHeight / 3

      const bodyX = bodyPosition.x * 100 - offsetX
      const bodyY = bodyPosition.y * -100 - offsetY

      modelValues.body.x.value = offsetX
      modelValues.body.y.value = offsetY
      modelValues.body.r.value = -carBodies.body.getAngle()

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