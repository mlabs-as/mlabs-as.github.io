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

function currentlyShowingSections() {
  const sectionBounds = Array.from(document.querySelectorAll('section'))
        .map(s => [s.offsetTop, s.offsetTop + s.offsetHeight])

  const {innerHeight, scrollY} = window
  const currentBounds = [scrollY, scrollY + innerHeight]

  return sectionBounds.reduce((n, [lower, upper]) => {
    const [start, end] = currentBounds;

    if (end <= lower || upper <= start) {
      return n
    }
    return n+1
  }, 0)
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

    const target = window.scrollY
    const sections = Array.from(document.querySelectorAll('section'))
    const closest = sections.reduce((a, b) =>
                                    Math.abs(target - a.offsetTop) < Math.abs(target - b.offsetTop) ? a : b
                                   )

    //         window.location.hash = closest.id
    if (currentlyShowingSections() > 1) {
      window.scrollTo({
        top: closest.offsetTop,
        behavior: 'smooth',
      })
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
