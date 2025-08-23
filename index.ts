import { Rive, Fit, Layout, ViewModelInstanceNumber } from '@rive-app/webgl2'
import { createScene } from './GamePhysics'

interface TransformProperties {
  x: ViewModelInstanceNumber | null
  y: ViewModelInstanceNumber | null
  r: ViewModelInstanceNumber | null
}

interface TerrainProperties {
  [key: string]: number
}

interface ModelValues {
  body?: TransformProperties
  'wheel 1'?: TransformProperties
  'wheel 2'?: TransformProperties
  'wheel 3'?: TransformProperties
  terrain?: ViewModelInstanceNumber[]
}

const el: HTMLCanvasElement = document.getElementById(
  'rive-canvas'
) as HTMLCanvasElement

let modelValues: ModelValues = {}

const { carBodies } = createScene()

// Set the transforms for the model instance
// based on the body position and angle
const setTransforms = (body, modelInstance, bodyX, bodyY) => {
  const postion = body.getPosition()
  modelInstance.x.value = postion.x * 100 - bodyX
  modelInstance.y.value = postion.y * -100 - bodyY
  modelInstance.r.value = -body.getAngle()
}

// Get the terrian properties from the physics simulator
const getTerrainProperties = (instance) => {
  return instance.properties.reduce((acc, property) => {
    const propName = property.name

    return {
      ...acc,
      [propName]: instance.number(propName),
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
      layoutScaleFactor: 0.6,
    }),
    artboard: 'MAIN',
    stateMachines: 'State Machine 1',
    onLoad: () => {
      const instance = r.viewModelInstance

      if (!instance) return

      const viewModelBody = instance.viewModel('body')
      if (!viewModelBody) return
      modelValues.body = {
        x: viewModelBody.number('x'),
        y: viewModelBody.number('y'),
        r: viewModelBody.number('r'),
      }

      const viewModelWheel1 = instance.viewModel('wheel 1')
      if (!viewModelWheel1) return
      modelValues['wheel 1'] = {
        x: viewModelWheel1.number('x'),
        y: viewModelWheel1.number('y'),
        r: viewModelWheel1.number('r'),
      }

      const viewModelWheel2 = instance.viewModel('wheel 2')
      if (!viewModelWheel2) return
      modelValues['wheel 2'] = {
        x: viewModelWheel2.number('x'),
        y: viewModelWheel2.number('y'),
        r: viewModelWheel2.number('r'),
      }

      const viewModelWheel3 = instance.viewModel('wheel 3')
      if (!viewModelWheel3) return
      modelValues['wheel 3'] = {
        x: viewModelWheel3.number('x'),
        y: viewModelWheel3.number('y'),
        r: viewModelWheel3.number('r'),
      }

      const terrain1Ys = getTerrainProperties(instance.viewModel('terrain 1'))
      const terrain2Ys = getTerrainProperties(instance.viewModel('terrain 2'))
      console.log(terrain1Ys, terrain2Ys)

      modelValues.terrain = [terrain1Ys, terrain2Ys]

      r.resizeDrawingSurfaceToCanvas()
    },
    onAdvance: () => {
      // Every time the Rive state machine advances, get the physics body positions
      if (!carBodies.body) return
      const bodyPosition = carBodies.body.getPosition()

      const offsetX = r.artboardWidth / 5
      const offsetY = r.artboardHeight / 3

      const bodyX = bodyPosition.x * 100 - offsetX
      const bodyY = bodyPosition.y * -100 - offsetY

      if (!modelValues.body) return

      if (modelValues.body.x) modelValues.body.x.value = offsetX
      if (modelValues.body.y) modelValues.body.y.value = offsetY
      if (modelValues.body.r)
        modelValues.body.r.value = -carBodies.body.getAngle()

      // update the terrain x1 and y1 positions
      if (!modelValues.terrain) return

      const terrain1XProp = modelValues.terrain[0]['terrain bone x 1']
      if (terrain1XProp)
        terrain1XProp.value = carBodies.terrain1['x1'] * 100 - bodyX
      console.log(carBodies)
      if (carBodies.lap > 1) {
        const terrain2XProp = modelValues.terrain[1]['terrain bone x 1']
        if (terrain2XProp)
          terrain2XProp.value = carBodies.terrain2['x1'] * 100 - bodyX
      }

      for (let i = 1; i <= 21; i++) {
        const terrain1Y = carBodies.terrain1[`y${i}`]
        const terrain1YProp = modelValues.terrain[0][`terrain bone y ${i}`]
        if (terrain1YProp) terrain1YProp.value = terrain1Y * -100 - bodyY

        if (carBodies.lap > 1) {
          const terrain2Y = carBodies.terrain2[`y${i}`]
          const terrain2YProp = modelValues.terrain[1][`terrain bone y ${i}`]
          if (terrain2YProp) terrain2YProp.value = terrain2Y * -100 - bodyY
        }
      }

      setTransforms(carBodies.front, modelValues['wheel 3'], bodyX, bodyY)
      setTransforms(carBodies.middle, modelValues['wheel 2'], bodyX, bodyY)
      setTransforms(carBodies.back, modelValues['wheel 1'], bodyX, bodyY)
    },
  })

  window.addEventListener(
    'resize',
    () => {
      r.resizeDrawingSurfaceToCanvas()
    },
    false
  )
}

main()
