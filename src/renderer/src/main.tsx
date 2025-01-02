import { render } from 'solid-js/web'
import './assets/index.css'
import './assets/reset.css'
import './assets/base.css'
import './assets/theme.css'
import App from './App'
import routes from '~solid-pages'
import { Router, Route } from '@solidjs/router'
import { Traverse } from 'neotraverse/modern';
import { lazy } from "solid-js";
import { unwrap } from 'solid-js/store'
import { createUsePreviousState } from './utils/previousState'


render(() => {
 const Routes =  routes
//  console.log({routes})
const [usePreviousState, PreviousStateProvider, RouterWithPreviousState] = createUsePreviousState()

  return (
    <Router root={(props) => (
      <PreviousStateProvider>
        <App {...props} usePreviousState={usePreviousState} />
      </PreviousStateProvider>
    )}>
      {routes}
    </Router>
  )
}, document.getElementById('root') as HTMLElement)
