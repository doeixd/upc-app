import { render } from 'solid-js/web'
import './assets/reset.css'
import './assets/base.css'
import './assets/theme.css'
import './assets/index.css'
import App from './App'
import routes from '~solid-pages'
import { Router, Route } from '@solidjs/router'
import { Traverse } from 'neotraverse/modern';
import { lazy } from "solid-js";
import { unwrap } from 'solid-js/store'


render(() => {
 const Routes =  routes
 console.log({routes})

  return (
    <Router root={App}>
      {routes}
    </Router>

  )
}, document.getElementById('root') as HTMLElement)

