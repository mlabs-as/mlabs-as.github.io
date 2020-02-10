const pageMapping = {
  '#research': 1,
  '#creative': 2,
  '#design': 3,
  '#development': 4,
  '#movie': 5,
}

const urlPage = pageMapping[window.location.hash] || 0

const {styler, spring, value, transform, stagger} = popmotion

const offsets = [0, 100, 200, 300, 400, 500]
const headers = Array.from(document.querySelectorAll('#about header'))
const paragraphs = document.querySelectorAll('#about article')

const setters = offsets.map((offset, i) => {
  return [
    value({x: `${offset}vw`}, styler(headers[i]).set),
    value({x: `${offset}vw`}, styler(paragraphs[i]).set),
  ]
})

function show(pageIndex) {
  const config = {
    // Stiffness of the spring. Higher values will create more sudden movement. (default: 100)
    stiffness: 120,
    // Strength of opposing force. If set to 0, spring will oscillate indefinitely. (default: 10)
    damping: 20,
    // Mass of the moving object. Higher values will result in more lethargic movement. (default: 1)
    mass: 1,
    // Initial velocity of the object, measured in units per second. (default: 0)
    velocity: 0,
    // End animation if distance to `to` is below this value and speed is below `restSpeed`.
    // When animation ends, spring gets “snapped” to `to`. (default: 0.01)
    restDelta: 0.01,
    // End animation if absolute speed (in units per second) drops below this value and
    // delta is smaller than `restDelta`. (default: 0.01)
    restSpeed: 0.01,
  }

  setters.forEach(([header, para], i) => {
    const animations = [
      spring({
        ...config,
        from: header.get(),
        to: { x: offsets[i] - pageIndex * 100 + 'vw' },
      }),
      spring({
        ...config,
        from: para.get(),
        to: { x: offsets[i] - pageIndex * 100 + 'vw' },
      })
    ]
    stagger(animations, 50)
      .start( ([h, p]) => {
        h && header.update(h)
        p && para.update(p)
      })
  })
}

function currentBounds() {
  const {innerHeight, scrollY} = window
  return {
    start:scrollY,
    height: innerHeight,
    end: scrollY + innerHeight,
  }
}

function sectionBounds() {
  return Array.from(document.querySelectorAll('section'))
    .map(s => ({
      lower: s.offsetTop,
      upper: s.offsetTop + s.offsetHeight,
      elem:s,
    }))
}

function sectionsShowing() {
  const {start, end, height} = currentBounds()
  const sections = sectionBounds()
  return sectionBounds()
    .reduce((agg, {lower, upper, elem}) => {
      const first = Math.max(lower, start)
      const second = Math.min(end, upper)
      const clamped = Math.max(0, second - first)
      const portion = clamped / height
      return portion > 0 ?
        agg.concat({ elem, portion }) : agg
    }, [])
}

let isScrolling = null
let scrollTrigger
window.addEventListener('scroll', event => {
  window.clearTimeout( scrollTrigger )
  scrollTrigger = setTimeout(() => {
    if(isScrolling) {
      if(window.scrollY === isScrolling) {
        isScrolling = null
      }
      return
    }

    const {height} = currentBounds()
    const [first, second] = sectionsShowing()

    // Two sections currently showing
    if (second) {
      const arg = first.portion > second.portion ? {
        // Bottom of first elem (could be larger than vh)
        top: first.elem.offsetTop + first.elem.offsetHeight - height,
        behavior: 'smooth',
      } :{
        top: second.elem.offsetTop,
        behavior: 'smooth',
      }
      window.scrollTo(arg)
    }
  }, 50)
})
function pageFromUrl() {
  const page = pageMapping[window.location.hash] || 0
  show(page)
}
window.onhashchange = pageFromUrl
// TODO: dont animate on initial render
pageFromUrl()
