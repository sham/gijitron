import * as React from 'react'
import * as Renderer from 'react-test-renderer'

import NoSSR from '../components/NoSSR'

test('component NoSSR', () => {
  const component = Renderer.create(
    <NoSSR>
      <p>No SSR.</p>
    </NoSSR>
  )
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})
