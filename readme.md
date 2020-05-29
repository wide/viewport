# Viewport

Handle intersection between elements and the viewport.


## Install

```
npm install @wide/viewport --save
```


## Usage

Observe `[data-viewport]` elements:
```js
import '@wide/viewport'
```
```html
<div data-viewport></div>
```

These elements will triggers 2 events when they appear in the viewport and when they leave:
```js
div.addEventListener('viewport.enter', e => {})
div.addEventListener('viewport.leave', e => {})
```

Aside from these events, they will received 4 `css` classes:
- `.viewport` on page loading, this is the default state
- `.viewport-enter` when the element is entering the viewport
- `.viewport-active` once the entering animation or transition is finished
- `.viewport-leave` when the element has left the viewport

### Custom CSS classes

You can replace the state class name with your own:
```html
<div data-viewport="fade"></div>
```

This element will now received these 4 `css` classes:
- `.fade`
- `.fade-enter`
- `.fade-active`
- `.fade-leave`

Exemple of an appearance transition:
```html
<div class="foo" data-viewport.once="fade"></div>
```
```scss
.fade {
  opacity: 0;
  transform: translateY(80px);
  transition: all 300ms;
  &-enter,
  &-active {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Observe once only

You can set an option to unlisten after entering the viewport once:
```html
<div data-viewport.once></div>
```


## Methods

Observe programmaticaly an element in the viewport:
```js
import viewport from '@wide/viewport'

const el = document.querySelector('.something')
viewport(el, {
  enter(el) {},
  leave(el) {},
  once: false,
  name: 'fade'
})
```


## Authors

- **Aymeric Assier** - [github.com/myeti](https://github.com/myeti)
- **Julien Martins Da Costa** - [github.com/jdacosta](https://github.com/jdacosta)


## License

This project is licensed under the MIT License - see the [licence](licence) file for details