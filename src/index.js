import observe from '@wide/dom-observer'

/**
 * Define if this is the 1st execution of the Intersection Observer
 * @type {Boolean}
 */
let IOBSERVER_FIRST_INIT = true


/**
 * Default class prefix
 * @type {String}
 */
const DEFAULT_NAME = 'viewport'


/**
 * Classlist factory
 * @type {Object<String, Function>}
 */
const CLASSLIST = {
  initial: name => getClassname(name),
  enter:   name => getClassname(name, '-enter'),
  active:  name => getClassname(name, '-active'),
  leave:   name => getClassname(name, '-leave')
}


/**
 * Default IntersectionObserver options
 * @type {Object}
 */
export const OBS_CONFIG = {
  rootMargin: '50px'
}


/**
 * Returns the name of the css class based on the state of the viewport
 * @param {String} name
 * @param {String} state
 */
function getClassname(name = DEFAULT_NAME, state = '') {
  return (name.trim() === '')
    ? `${DEFAULT_NAME}${state}`
    : `${name}${state}`
}


/**
 * Check element state
 * @param {HTMLElement} el
 * @param {String} state
 * @param {String} name
 * @return {Boolean}
 */
function isState(el, state, name) {
  return el.classList.contains(CLASSLIST[state](name))
}


/**
 * Set initial state
 * @param {HTMLElement} el
 * @param {String} name
 */
function setInitial(el, name) {
  el.classList.add(CLASSLIST.initial(name))
}


/**
 * Set enter state
 * @param {HTMLElement} el
 * @param {String} name
 */
function setEnter(el, name) {
  el.addEventListener('animationend', e => setActive(el, name), { once: true })
  el.addEventListener('transitionend', e => setActive(el, name), { once: true })

  el.classList.add(CLASSLIST.enter(name))
  el.classList.remove(CLASSLIST.active(name))
  el.classList.remove(CLASSLIST.leave(name))
}


/**
 * Set active state
 * @param {HTMLElement} el
 * @param {String} name
 */
function setActive(el, name) {
  el.removeEventListener('animationend', e => setActive(el, name), { once: true })
  el.removeEventListener('transitionend', e => setActive(el, name), { once: true })

  el.classList.remove(CLASSLIST.enter(name))
  el.classList.add(CLASSLIST.active(name))
  el.classList.remove(CLASSLIST.leave(name))
}


/**
 * Set leave state
 * @param {HTMLElement} el
 * @param {String} name
 */
function setLeave(el, name) {
  el.addEventListener('animationend', e => setInactive(el, name), { once: true })
  el.addEventListener('transitionend', e => setInactive(el, name), { once: true })

  el.classList.remove(CLASSLIST.enter(name))
  el.classList.remove(CLASSLIST.active(name))
  el.classList.add(CLASSLIST.leave(name))
}


/**
 * Set inactive state
 * @param {HTMLElement} el
 * @param {String} name
 */
function setInactive(el, name) {
  el.removeEventListener('animationend', e => setInactive(el, name), { once: true })
  el.removeEventListener('transitionend', e => setInactive(el, name), { once: true })

  el.classList.remove(CLASSLIST.enter(name))
  el.classList.remove(CLASSLIST.active(name))
  el.classList.remove(CLASSLIST.leave(name))
}


/**
 * Get details about the element, like the scroll direction
 * but also the triggering edge from the window
 * @param {Object} entry
 */
function viewportEventDetail(entry) {
  let output = null

  if (!IOBSERVER_FIRST_INIT) {
    output = entry.boundingClientRect.top < 0
      ? entry.isIntersecting
        ? { edge: 'top', scroll: 'up' }
        : { edge: 'top', scroll: 'down' }
      : entry.isIntersecting
        ? { edge: 'bottom', scroll: 'down' }
        : { edge: 'bottom', scroll: 'up' }
  }

  return output
}


/**
 * Observe viewport and update element when it enter/leave
 * @type {IntersectionObserver}
 */
const obs = new IntersectionObserver(entries => {
  for(let i = 0; i < entries.length; i++) {

    // get target element
    const el = entries[i].target
    const name = el.dataset['viewport.once'] || el.dataset.viewport
    const isInside = entries[i].isIntersecting
    const isActive = isState(el, 'active', name)
    const isInitial = isState(el, 'initial', name)

    // set initial state
    if(!isInitial) setInitial(el, name)

    // element is entering viewport
    if(isInside && !isActive) setEnter(el, name)

    // element is leaving viewport
    else if(!isInside && isActive) setLeave(el, name)

    // trigger local event
    const event = new CustomEvent(
      `viewport.${isInside ? 'enter' : 'leave'}`,
      { detail: viewportEventDetail(entries[i]) }
    )
    el.dispatchEvent(event)

    // unobserve if once only
    if(isInside && typeof el.dataset['viewport.once'] !== 'undefined') {
      unobserve(el)
    }
  }

  IOBSERVER_FIRST_INIT = false
}, OBS_CONFIG)


/**
 * Observe element [data-viewport] in DOM to add effect
 */
observe(`[data-viewport], [data-viewport\\.once]`, {
  bind: el => obs.observe(el),
  unbind: el => obs.unobserve(el)
})


/**
 * Unobserve element
 * @param {HTMLElement} el
 */
export function unobserve(el) {
  obs.unobserve(el)
}


/**
 * Observe element
 * @param {HTMLElement} el
 * @param {Object} cfg
 * @param {Function} cfg.enter
 * @param {Function} cfg.leave
 * @param {Boolean}  cfg.once
 * @param {String}   cfg.name
 */
export default function viewport(el, { enter, leave, once = false, name = null }) {
  if(once) el.setAttribute('data-viewport.once', '')
  if(name) el.setAttribute(`data-viewport${once ? '.once' : ''}`, name)
  if(enter) el.addEventListener('viewport.enter', enter)
  if(leave) el.addEventListener('viewport.leave', leave)
  obs.observe(el)
}